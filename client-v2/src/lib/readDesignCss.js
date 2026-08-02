import { readFileSync } from 'fs';
import path from 'path';

/**
 * Next/Turbopack has no built-in equivalent of Vite's `?raw` import suffix, and
 * configuring a raw-loader through turbopack.rules would need an extra dependency
 * for just two files. Reading the stylesheet at render time in a server component
 * gets the same "inline this file's exact text" result with no bundler config.
 */
export function readDesignCss(relativeToSrc) {
  return readFileSync(path.join(process.cwd(), 'src', relativeToSrc), 'utf8');
}
