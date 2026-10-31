import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SAMPLE, formatPostcode, getAdministrativeNames } from '../lib/postcode.ts';

// FC-01-A01-KP-27 must decode the same way on every surface (homepage, footer,
// verdict screen, application). Labels come from lib/postcode.ts only.
test('sandbox sample decodes LGA 01 as AMAC and district A01 as Garki', () => {
  const names = getAdministrativeNames(formatPostcode(SAMPLE)?.segments);
  assert.equal(names.lgaCode, '01');
  assert.equal(names.lgaName, 'Abuja Municipal Area Council (AMAC)');
  assert.equal(names.districtCode, 'A01');
  assert.equal(names.districtName, 'Garki');
});

test('no marketing surface hard-codes a conflicting LGA name for the sample', () => {
  for (const file of [
    'app/(marketing)/overview/page.tsx',
    'app/(marketing)/how-it-works/page.tsx',
    'components/marketing-shell.tsx',
  ]) {
    assert.doesNotMatch(readFileSync(file, 'utf8'), /Abaji/, file);
  }
});
