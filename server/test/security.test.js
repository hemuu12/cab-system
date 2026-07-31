import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { authenticate } from '../src/middleware/auth.js';
import { rateLimit } from '../src/middleware/rateLimit.js';
import { accessSecret, hashOpaqueToken, safeTokenMatch, TOKEN_AUDIENCE, TOKEN_ISSUER } from '../src/utils/security.js';
import { isTrustedOrigin } from '../src/utils/origins.js';
import { isSupportedImage } from '../src/utils/image.js';

function responseRecorder() {
  return {
    statusCode: 200,
    body: undefined,
    headers: {},
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
    setHeader(name, value) { this.headers[name] = value; }
  };
}

test('booking capability tokens compare only against their hash', () => {
  const token = 'private-booking-capability';
  const hash = hashOpaqueToken(token);
  assert.equal(safeTokenMatch(token, hash), true);
  assert.equal(safeTokenMatch('different-token', hash), false);
  assert.equal(safeTokenMatch('', ''), false);
  assert.equal(hash.includes(token), false);
});

test('access tokens require the configured issuer and audience', async () => {
  const token = jwt.sign({ sub: '507f1f77bcf86cd799439011' }, accessSecret(), {
    algorithm: 'HS256', issuer: 'untrusted-service', audience: TOKEN_AUDIENCE
  });
  const req = { get: name => name === 'authorization' ? `Bearer ${token}` : '' };
  const res = responseRecorder();
  let called = false;
  await authenticate(req, res, () => { called = true; });
  assert.equal(called, false);
  assert.equal(res.statusCode, 401);

  const wrongAudience = jwt.sign({ sub: '507f1f77bcf86cd799439011' }, accessSecret(), {
    algorithm: 'HS256', issuer: TOKEN_ISSUER, audience: 'another-app'
  });
  const res2 = responseRecorder();
  await authenticate({ get: () => `Bearer ${wrongAudience}` }, res2, () => {});
  assert.equal(res2.statusCode, 401);
});

test('fallback rate limiter blocks requests after its configured maximum', async () => {
  const middleware = rateLimit({ scope: `test-${Date.now()}`, max: 2, windowMs: 60_000 });
  const request = { ip: '203.0.113.9', body: {} };
  const statuses = [];
  for (let index = 0; index < 3; index += 1) {
    const res = responseRecorder();
    let allowed = false;
    await middleware(request, res, () => { allowed = true; });
    statuses.push({ allowed, code: res.statusCode });
  }
  assert.deepEqual(statuses, [
    { allowed: true, code: 200 },
    { allowed: true, code: 200 },
    { allowed: false, code: 429 }
  ]);
});

test('origin allowlist accepts owned sites and rejects lookalike domains', () => {
  assert.equal(isTrustedOrigin('https://wondertravel.online'), true);
  assert.equal(isTrustedOrigin('https://wondertravel.online.attacker.example'), false);
  assert.equal(isTrustedOrigin('http://wondertravel.online'), false);
});

test('image validation uses file signatures instead of claimed MIME types', () => {
  assert.equal(isSupportedImage(Buffer.from([0xff, 0xd8, 0xff, ...Array(9).fill(0)])), true);
  assert.equal(isSupportedImage(Buffer.from('<script>alert(1)</script>')), false);
});
