export function createRemindersRepository(db) {
  return {
    async create(id, userId, input) {
      return (
        await db.query(
          `INSERT INTO reminders(
            id,
            user_id,
            title,
            time,
            weekdays,
            timezone,
            active
          )
          VALUES ($1,$2,$3,$4,$5,$6,$7)
          RETURNING *`,
          [
            id,
            userId,
            input.title,
            input.time,
            input.weekdays,
            input.timezone,
            input.active
          ]
        )
      ).rows[0];
    },

    async list(userId) {
      return (
        await db.query(
          `SELECT *
           FROM reminders
           WHERE user_id=$1
           ORDER BY time ASC, created_at ASC`,
          [userId]
        )
      ).rows;
    },

    async get(userId, id) {
      return (
        await db.query(
          `SELECT *
           FROM reminders
           WHERE user_id=$1 AND id=$2`,
          [userId, id]
        )
      ).rows[0];
    },

    async update(userId, id, values) {
      const columns = {
        title: 'title',
        time: 'time',
        weekdays: 'weekdays',
        timezone: 'timezone',
        active: 'active'
      };

      const entries = Object.entries(values);

      const assignments = entries
        .map(([key], index) => `${columns[key]}=$${index + 3}`)
        .join(',');

      return (
        await db.query(
          `UPDATE reminders
           SET ${assignments}, updated_at=now()
           WHERE user_id=$1 AND id=$2
           RETURNING *`,
          [
            userId,
            id,
            ...entries.map(([, value]) => value)
          ]
        )
      ).rows[0];
    },

    async remove(userId, id) {
      return (
        await db.query(
          `DELETE FROM reminders
           WHERE user_id=$1 AND id=$2
           RETURNING id`,
          [userId, id]
        )
      ).rowCount > 0;
    }
  };
}
