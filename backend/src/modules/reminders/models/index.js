export function reminderView(row) {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    time: String(row.time).slice(0, 5),
    weekdays: row.weekdays,
    timezone: row.timezone,
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
