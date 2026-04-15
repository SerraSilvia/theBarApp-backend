import { eq } from 'drizzle-orm'
import jwt from 'jsonwebtoken'
import { db } from '../../db'
import * as schema from '../../db/schema'
import { compareHash } from '../../utils'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const { email, password } = await readBody(event)

  if (!email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields',
    })
  }

  const existingUser = await db.query.users.findFirst({
    where: eq(schema.users.email, email),
  })

  if (!existingUser) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid email or password. Please try again.',
    })
  }

  if (!existingUser.password) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid email or password. Please try again.',
    })
  }

  // @ts-ignore
  const isValid = await compareHash(existingUser.password, password)

  if (!isValid) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid email or password. Please try again.',
    })
  }

  const { password: _, ...userWithoutPassword } = existingUser

  const token = jwt.sign(userWithoutPassword, config.jwtSecret, {
    expiresIn: '1h', // El token expirará en 1 hora
  })

  return {
    user: userWithoutPassword,
    token,
  }
})
