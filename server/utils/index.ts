// server/utils/index.ts
import { compare } from 'bcrypt';

/**
 * Verifica si una contraseña coincide con un hash.
 */
export async function compareHash(hash: string, plainTextPassword: string): Promise<boolean> {
  return await compare(plainTextPassword, hash);
}