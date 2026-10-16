export function contentView(row, userPlan) {
  const locked =
    row.is_premium && userPlan !== 'premium';

  return {
    id: row.id,
    title: row.title,
    category: row.category,
    type: row.type,
    difficulty: row.difficulty,
    isPremium: row.is_premium,
    locked,
    textContent:
      locked ? null : row.text_content,
    url:
      locked ? null : row.url,
    createdAt: row.created_at
  };
}
