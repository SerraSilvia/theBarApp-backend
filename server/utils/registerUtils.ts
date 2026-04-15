import { eq } from "drizzle-orm";
import { db } from "../db";
import * as schema from "../db/schema";
import { hash } from "bcrypt"; // 1. Importar 'hash' desde bcrypt

export async function throwIfUserExists(email: string) {
  const existingUser = await db.query.users.findFirst({
    where: eq(schema.users.email, email),
  });

  if (existingUser) {
    throw createError({
      statusCode: 400,
      statusMessage: "Account already exists. Please login.",
    });
  }
}

export async function registerUser(
  email: string,
  name: string,
  password: string
) {
  const result = await db
    .insert(schema.users)
    .values({
      name,
      email,
      password: await hash(password, 10), // 2. Usar 'hash' para encriptar la contraseña
      login: email,
    })
    .returning();

  const newUser = result.at(0);
  if (!newUser) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to register user",
    });
  }
  return newUser;
}
