import assert from 'node:assert/strict';
import fs from 'node:fs';
const sw=fs.readFileSync(new URL('../sw.js', import.meta.url),'utf8');
const pwa=fs.readFileSync(new URL('../assets/js/pwa.js', import.meta.url),'utf8');
assert.ok(sw.includes("networkFirst"));
assert.ok(sw.includes("request.destination"));
assert.ok(pwa.includes("registration.update()"));
assert.ok(pwa.includes("controllerchange"));
console.log('PWA update strategy tests: OK');
