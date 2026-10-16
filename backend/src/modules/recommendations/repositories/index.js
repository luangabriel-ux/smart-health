export function createRecommendationsRepository(db) {
  return {
    async getProfile(userId) {
      return (
        await db.query(
          `SELECT
             age,
             weight_kg,
             height_cm,
             health_goals,
             medical_conditions
           FROM users
           WHERE id = $1`,
          [userId]
        )
      ).rows[0];
    }
  };
}
