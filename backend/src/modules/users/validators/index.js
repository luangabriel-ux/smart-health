import { object, string, number, invalid } from '../../../shared/validation.js';
export function credentials(body, register = false) {
  object(body, register ? ['name', 'email', 'password'] : ['email', 'password']);
  const email = string(body.email, 'E-mail', 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) invalid('E-mail inválido.');
  if (typeof body.password !== 'string' || body.password.length < 8 || body.password.length > 128) invalid('Senha deve ter entre 8 e 128 caracteres.');
  return { email, password: body.password, ...(register ? { name: string(body.name, 'Nome', 120) } : {}) };
}
export function profile(body) {
  object(body, ['name', 'age', 'weightKg', 'heightCm', 'healthGoals', 'medicalConditions']);
  if (!Object.keys(body).length) invalid('Informe ao menos um campo.');
  const result = {};
  for (const [key, value] of Object.entries(body)) {
    if (key === 'name') result[key] = string(value, key, 120);
    else if (value === null) result[key] = null;
    else if (key === 'age') result[key] = number(value, key, 1, 120, true);
    else if (key === 'weightKg') result[key] = number(value, key, 0.01, 500);
    else if (key === 'heightCm') result[key] = number(value, key, 0.01, 300);
    else result[key] = string(value, key, key === 'healthGoals' ? 1000 : 2000);
  }
  return result;
}
