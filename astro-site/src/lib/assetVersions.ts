import { createHash } from 'node:crypto';
// Inlined into the server bundle at build time, so the hash always matches the
// file that ships, wherever the built server runs from.
import trackJs from '../../public/js/ln-track.js?raw';

// Content-hash query strings for hand-built files in public/, so a new deploy
// is never served from a stale browser cache.
const version = (src: string) => createHash('md5').update(src).digest('hex').slice(0, 10);

export const trackJsVersion = version(trackJs);
