import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ADMIN_PERMISSIONS,
  ADMIN_MANAGEABLE_SECTIONS,
  adminPermissionsFor,
  adminSectionsFor,
  requireAdminPermission,
  requireAdminSection
} from '../src/middleware/auth.js';
import User from '../src/models/User.js';
import PushSubscription from '../src/models/PushSubscription.js';
import { adminRealtimeCapability, pushEndpointHash } from '../src/utils/realtime.js';

test('user schema allows only one super administrator', () => {
  const index = User.schema.indexes().find(([, options]) => (
    options.unique && options.partialFilterExpression?.adminRole === 'super_admin'
  ));

  assert.deepEqual(index?.[0], { adminRole: 1 });
});

test('normal administrators can read, create, and update but cannot delete or manage accounts', () => {
  const permissions = adminPermissionsFor({ role: 'admin', adminRole: 'admin' });

  assert.deepEqual(permissions, [
    ADMIN_PERMISSIONS.READ,
    ADMIN_PERMISSIONS.CREATE,
    ADMIN_PERMISSIONS.UPDATE
  ]);
  assert.equal(permissions.includes(ADMIN_PERMISSIONS.DELETE), false);
  assert.equal(permissions.includes(ADMIN_PERMISSIONS.MANAGE_ADMINS), false);
});

test('super administrator receives every admin permission', () => {
  const permissions = adminPermissionsFor({ role: 'admin', adminRole: 'super_admin' });

  assert.deepEqual(new Set(permissions), new Set(Object.values(ADMIN_PERMISSIONS)));
});

test('customers receive no admin permissions', () => {
  assert.deepEqual(adminPermissionsFor({ role: 'customer' }), []);
});

test('normal administrators receive only their assigned sections', () => {
  assert.deepEqual(
    adminSectionsFor({ role: 'admin', adminRole: 'admin', adminSections: ['drivers', 'bookings'] }),
    ['dashboard', 'drivers', 'bookings']
  );
  assert.deepEqual(
    adminSectionsFor({ role: 'admin', adminRole: 'admin', adminSections: [] }),
    ['dashboard']
  );
});

test('legacy administrators retain operational access until the super-admin changes it', () => {
  assert.deepEqual(
    adminSectionsFor({ role: 'admin', adminRole: 'admin' }),
    ['dashboard', ...ADMIN_MANAGEABLE_SECTIONS]
  );
});

test('super administrator receives all sections including user management', () => {
  assert.deepEqual(
    adminSectionsFor({ role: 'admin', adminRole: 'super_admin' }),
    ['dashboard', ...ADMIN_MANAGEABLE_SECTIONS, 'users', 'audit']
  );
});

test('realtime tokens subscribe only to an administrator assigned sections', () => {
  assert.deepEqual(adminRealtimeCapability(['dashboard', 'bookings', 'feedback']), {
    'wondertravel:admin-activity:bookings': ['subscribe'],
    'wondertravel:admin-activity:feedback': ['subscribe']
  });
});

test('push subscriptions are uniquely identified without logging their endpoint', () => {
  const endpoint = 'https://push.example.test/subscription/secret';
  const endpointIndex = PushSubscription.schema.indexes().find(([, options]) => options.unique);

  assert.deepEqual(endpointIndex?.[0], { endpointHash: 1 });
  assert.equal(pushEndpointHash(endpoint), pushEndpointHash(endpoint));
  assert.equal(pushEndpointHash(endpoint).includes('secret'), false);
});

test('section middleware blocks unassigned admin modules', () => {
  const req = {
    user: { role: 'admin', adminRole: 'admin', adminSections: ['drivers'] }
  };
  const response = {
    statusCode: 200,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    }
  };
  let continued = false;

  requireAdminSection('vehicles')(req, response, () => {
    continued = true;
  });

  assert.equal(continued, false);
  assert.equal(response.statusCode, 403);
  assert.match(response.body.message, /access/i);
});

test('permission middleware rejects destructive actions from a normal administrator', () => {
  const req = { user: { role: 'admin', adminRole: 'admin' } };
  const response = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    }
  };
  let continued = false;

  requireAdminPermission(ADMIN_PERMISSIONS.DELETE)(req, response, () => {
    continued = true;
  });

  assert.equal(continued, false);
  assert.equal(response.statusCode, 403);
  assert.match(response.body.message, /super administrator/i);
});

test('permission middleware allows the super administrator to delete', () => {
  const req = { user: { role: 'admin', adminRole: 'super_admin' } };
  let continued = false;

  requireAdminPermission(ADMIN_PERMISSIONS.DELETE)(req, {}, () => {
    continued = true;
  });

  assert.equal(continued, true);
});
