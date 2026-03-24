import { User } from '../domain/user.entity';

/** Retorna uma cópia do usuário sem o campo password. */
export function sanitizeUser(user: User): Omit<User, 'password'> {
  const { password: _password, ...safe } = user;
  return safe;
}
