export function activityView(row) {
  return { id: row.id, userId: row.user_id, type: row.type, description: row.description,
    occurredAt: row.occurred_at, durationMinutes: row.duration_minutes, waterMl: row.water_ml,
    steps: row.steps, calories: row.calories, createdAt: row.created_at };
}
