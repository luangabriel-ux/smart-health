const key = (userId: string) => `smart-health.favorites.${userId}`;
export function readFavorites(
  storage: Pick<Storage, 'getItem'>,
  userId: string,
): string[] {
  try {
    const value = JSON.parse(storage.getItem(key(userId)) ?? '[]');
    return Array.isArray(value)
      ? [
          ...new Set(
            value.filter(
              (item): item is string =>
                typeof item === 'string' && /^[a-f0-9-]{36}$/i.test(item),
            ),
          ),
        ].slice(0, 100)
      : [];
  } catch {
    return [];
  }
}
export function saveFavorites(
  storage: Pick<Storage, 'setItem'>,
  userId: string,
  ids: string[],
) {
  try {
    storage.setItem(key(userId), JSON.stringify(ids.slice(0, 100)));
    return true;
  } catch {
    return false;
  }
}
