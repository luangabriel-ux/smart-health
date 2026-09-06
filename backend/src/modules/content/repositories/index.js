export function createContentRepository(db) {
  return {
    async list(filters) {
      const conditions = [];
      const values = [];

      if (filters.category !== undefined) {
        values.push(filters.category);
        conditions.push(
          `category = $${values.length}`
        );
      }

      if (filters.type !== undefined) {
        values.push(filters.type);
        conditions.push(
          `type = $${values.length}`
        );
      }

      if (filters.difficulty !== undefined) {
        values.push(filters.difficulty);
        conditions.push(
          `difficulty = $${values.length}`
        );
      }

      values.push(filters.limit);
      const limitPosition = values.length;

      values.push(filters.offset);
      const offsetPosition = values.length;

      const where =
        conditions.length > 0
          ? `WHERE ${conditions.join(' AND ')}`
          : '';

      return (
        await db.query(
          `SELECT *
           FROM contents
           ${where}
           ORDER BY created_at DESC, id
           LIMIT $${limitPosition}
           OFFSET $${offsetPosition}`,
          values
        )
      ).rows;
    },

    async get(id) {
      return (
        await db.query(
          `SELECT *
           FROM contents
           WHERE id = $1`,
          [id]
        )
      ).rows[0];
    }
  };
}
