import assert from 'node:assert/strict';
import { isStrongPassword } from '../src/utils/passwordRules.js';

assert.equal(isStrongPassword('BrainBuzz1!'), true);
assert.equal(isStrongPassword('Quiz@2026A'), true);
assert.equal(isStrongPassword('password'), false);
assert.equal(isStrongPassword('Password1'), false);
assert.equal(isStrongPassword('Pass!'), false);

console.log('backend passwordRules tests passed');
