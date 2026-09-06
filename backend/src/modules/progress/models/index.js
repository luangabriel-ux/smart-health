export function progressDayView(row) {
  return {
    date: row.date,
    waterMl: Number(row.water_ml),
    steps: Number(row.steps),
    durationMinutes: Number(row.duration_minutes),
    calories: Number(row.calories)
  };
}

export function progressGoalsView(row) {
  if (!row) {
    return null;
  }

  return {
    steps: row.steps,
    waterMl: row.water_ml,
    durationMinutes: row.duration_minutes,
    calories: row.calories,
    updatedAt: row.updated_at
  };
}
