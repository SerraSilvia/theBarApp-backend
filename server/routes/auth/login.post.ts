import { eq } from "drizzle-orm";
import { db } from '../../db'; 
import * as schema from '../../db/schema';


export default defineEventHandler(async (event) => {
  const { email, password } = await readBody(event);

  if (!email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing required fields",
    });
  }

  const existingUser = await db.query.users.findFirst({
    where: eq(schema.users.email, email),
  });

  if (!existingUser) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid email or password. Please try again.",
    });
  }

  if (!existingUser.password) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid email or password. Please try again.",
    });
  }

  const isValid = await compareHash(existingUser.password, password);

  if (!isValid) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid email or password. Please try again.",
    });
  }

  const { password: stash, ...userWithoutPassword } = existingUser;
  await setUserSession(event, {
    user: userWithoutPassword,
  });
  return userWithoutPassword;
});
