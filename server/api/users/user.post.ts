import { z } from 'zod'
import { throwIfUserExists, registerUser } from '../../utils/registerUtils'

// 1. Esquema de Zod para validar los datos del registro.
const registerSchema = z.object({
  email: z.string().email('El correo electrónico no es válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // 2. Validamos el cuerpo de la petición con nuestro esquema.
  const result = registerSchema.safeParse(body)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: 'Datos de registro inválidos',
      data: result.error.format(),
    })
  }

  const { email, password } = result.data

  try {
    // 3. Verificamos si el usuario ya existe antes de intentar registrarlo.
    await throwIfUserExists(email)

    // 4. Si no existe, procedemos a registrarlo.
    // La función registerUser se encarga de hashear la contraseña.
    // Usamos el email como 'name' y 'login' por defecto.
    const newUser = await registerUser(email, email, password)

    // Omitimos la contraseña en la respuesta por seguridad.
    const { password: _, ...userWithoutPassword } = newUser

    return {
      message: 'Usuario registrado con éxito',
      user: userWithoutPassword,
    }
  } catch (error: any) {
    // Si el error ya es un H3Error (lanzado por throwIfUserExists), lo relanzamos.
    if (error.statusCode) {
      throw error
    }

    // Si es otro tipo de error, lo envolvemos en un error 500.
    console.error('Error en el registro de usuario:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Error interno al registrar el usuario',
    })
  }
})
