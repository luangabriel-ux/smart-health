export function createUsersRepository(db) {
  return {
    async create({ id, name, email, passwordHash }) {
      return (await db.query('INSERT INTO users(id,name,email,password_hash) VALUES ($1,$2,$3,$4) RETURNING *', [id,name,email,passwordHash])).rows[0];
    },
    async byEmail(email) { return (await db.query('SELECT * FROM users WHERE email=$1', [email])).rows[0]; },
    async byId(id) { return (await db.query('SELECT * FROM users WHERE id=$1', [id])).rows[0]; },
    async update(id, values) {
      const columns = { name: 'name', age: 'age', weightKg: 'weight_kg', heightCm: 'height_cm', healthGoals: 'health_goals', medicalConditions: 'medical_conditions' };
      const entries = Object.entries(values);
      return (await db.query(`UPDATE users SET ${entries.map(([key], i) => `${columns[key]}=$${i+2}`).join(',')},updated_at=now() WHERE id=$1 RETURNING *`, [id,...entries.map(([, value]) => value)])).rows[0];
    },
    async session(hash, userId, expiresAt) { await db.query('INSERT INTO sessions(token_hash,user_id,expires_at) VALUES ($1,$2,$3)', [hash,userId,expiresAt]); },
    async authenticated(hash) { return (await db.query('SELECT u.* FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=$1 AND s.expires_at > now()', [hash])).rows[0]; },
    async revoke(hash) { await db.query('DELETE FROM sessions WHERE token_hash=$1', [hash]); }
  };
}
