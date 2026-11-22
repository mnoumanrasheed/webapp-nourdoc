import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
// Static architectural checks require no npm install; end-to-end checks still need a running app.
const text = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
test('report lookup checks role and scope', () => {
  const source = text('app/api/reports/[id]/route.ts');
  assert.match(source, /apiUser\("doctor"\)/);
  assert.match(source, /r\.doctorId === user\.doctorId/);
  assert.match(source, /r\.hospitalId === user\.hospitalId/);
});
test('overview endpoints authorize server side', () => {
  assert.match(text('app/api/hospital/overview/route.ts'), /apiUser\("hospital_admin"\)/);
  assert.match(text('app/api/doctor/overview/route.ts'), /apiUser\("doctor"\)/);
});
test('clinical writes explicitly unimplemented', () => {
  assert.match(text('app/api/reports/[id]/route.ts'), /status: 501/);
});
test('session cookies cannot be read by client JS', () => {
  assert.match(text('lib/session.ts'), /httpOnly: true/);
  assert.match(text('lib/session.ts'), /timingSafeEqual/);
});
