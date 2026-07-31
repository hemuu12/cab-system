const startsWith = (buffer, bytes) => bytes.every((byte, index) => buffer[index] === byte);

/** Checks file signatures because browser-supplied MIME types are not trustworthy. */
export function isSupportedImage(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 12) return false;
  if (startsWith(buffer, [0xff, 0xd8, 0xff])) return true;
  if (startsWith(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return true;
  if (buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP') return true;
  return buffer.subarray(4, 8).toString('ascii') === 'ftyp' && ['avif', 'avis'].includes(buffer.subarray(8, 12).toString('ascii'));
}
