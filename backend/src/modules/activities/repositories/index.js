export function createActivitiesRepository(db) {
  return {
    async create(id, userId, input) {
      return (await db.query(`INSERT INTO activities(id,user_id,type,description,occurred_at,duration_minutes,water_ml,steps,calories)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`, [id,userId,input.type,input.description,input.occurredAt,input.durationMinutes ?? null,input.waterMl ?? null,input.steps ?? null,input.calories ?? null])).rows[0];
    },
    async list(userId, { limit, offset }) { return (await db.query('SELECT * FROM activities WHERE user_id=$1 ORDER BY occurred_at DESC,id LIMIT $2 OFFSET $3', [userId,limit,offset])).rows; },
    async get(userId, id) { return (await db.query('SELECT * FROM activities WHERE user_id=$1 AND id=$2', [userId,id])).rows[0]; },
    async remove(userId, id) { return (await db.query('DELETE FROM activities WHERE user_id=$1 AND id=$2 RETURNING id', [userId,id])).rowCount > 0; }
  };
}
