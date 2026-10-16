import test from 'node:test';
import assert from 'node:assert/strict';
import { createReminder, updateReminder } from '../src/modules/reminders/validators/index.js';

test('categoria de lembrete mantém compatibilidade e rejeita valores desconhecidos', () => {
  const input = { title: 'Rotina', time: '09:00', weekdays: [1] };
  assert.equal(createReminder(input).category, 'habit');
  for (const category of ['exercise','medication','water','meal','habit']) {
    assert.equal(createReminder({ ...input, category }).category, category);
    assert.equal(updateReminder({ category }).category, category);
  }
  for (const category of ['', 'unknown', null, {}, []]) {
    assert.throws(() => createReminder({ ...input, category }));
    assert.throws(() => updateReminder({ category }));
  }
});
