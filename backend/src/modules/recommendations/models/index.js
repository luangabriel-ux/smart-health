export function recommendationView({
  code,
  title,
  message,
  basedOn
}) {
  return {
    code,
    title,
    message,
    basedOn
  };
}

export function profileBasisView(row) {
  return {
    age: row.age,
    weightKg:
      row.weight_kg === null
        ? null
        : Number(row.weight_kg),
    heightCm:
      row.height_cm === null
        ? null
        : Number(row.height_cm),
    healthGoals: row.health_goals
  };
}
