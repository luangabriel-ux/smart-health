export function publicUser(row) {
  return { id: row.id, name: row.name, email: row.email, plan: row.plan,
    age: row.age, weightKg: row.weight_kg === null ? null : Number(row.weight_kg),
    heightCm: row.height_cm === null ? null : Number(row.height_cm),
    healthGoals: row.health_goals, medicalConditions: row.medical_conditions,
    createdAt: row.created_at, updatedAt: row.updated_at };
}
