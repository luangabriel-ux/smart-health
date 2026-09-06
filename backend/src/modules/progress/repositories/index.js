export function createProgressRepository(db) {
  return {
    async list(userId, { from, to }) {
      return (
        await db.query(
          `SELECT
             to_char(
               (occurred_at AT TIME ZONE 'America/Sao_Paulo')::date,
               'YYYY-MM-DD'
             ) AS date,
             COALESCE(SUM(water_ml), 0) AS water_ml,
             COALESCE(SUM(steps), 0) AS steps,
             COALESCE(SUM(duration_minutes), 0) AS duration_minutes,
             COALESCE(
               SUM(
                 CASE
                   WHEN type = 'exercise'
                   THEN calories
                   ELSE 0
                 END
               ),
               0
             ) AS calories
           FROM activities
           WHERE user_id = $1
             AND (
               occurred_at AT TIME ZONE 'America/Sao_Paulo'
             )::date BETWEEN $2::date AND $3::date
           GROUP BY 1
           ORDER BY 1`,
          [userId, from, to]
        )
      ).rows;
    },

    async getGoals(userId) {
      return (
        await db.query(
          `SELECT *
           FROM progress_goals
           WHERE user_id = $1`,
          [userId]
        )
      ).rows[0];
    },

    async replaceGoals(userId, input) {
      return (
        await db.query(
          `INSERT INTO progress_goals(
             user_id,
             steps,
             water_ml,
             duration_minutes,
             calories,
             updated_at
           )
           VALUES ($1, $2, $3, $4, $5, now())
           ON CONFLICT (user_id)
           DO UPDATE SET
             steps = EXCLUDED.steps,
             water_ml = EXCLUDED.water_ml,
             duration_minutes = EXCLUDED.duration_minutes,
             calories = EXCLUDED.calories,
             updated_at = now()
           RETURNING *`,
          [
            userId,
            input.steps ?? null,
            input.waterMl ?? null,
            input.durationMinutes ?? null,
            input.calories ?? null
          ]
        )
      ).rows[0];
    }
  };
}
