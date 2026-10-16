import test from 'node:test';
import assert from 'node:assert/strict';
import { readFavorites, saveFavorites } from '../src/services/favorites.ts';

test('favoritos locais são separados por conta e toleram armazenamento inválido', () => {
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
  const id = '12345678-1234-1234-1234-123456789012';
  assert.equal(saveFavorites(storage, 'ana', [id, id]), true);
  assert.deepEqual(readFavorites(storage, 'ana'), [id]);
  assert.deepEqual(readFavorites(storage, 'other'), []);
  assert.deepEqual(readFavorites({ getItem: () => '{invalid' }, 'ana'), []);
  assert.equal(
    saveFavorites(
      {
        setItem() {
          throw new Error();
        },
      },
      'ana',
      [id],
    ),
    false,
  );
});
