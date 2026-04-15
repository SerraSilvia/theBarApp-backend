// server/middleware/auth.ts
import jwt from 'jsonwebtoken'
const { verify } = jwt

export default defineEventHandler((event) => {
  const path = getRequestPath(event)

  // Ignoramos las rutas de login y registro para que no requieran token
  if (path.startsWith('/api/auth/')) {
    return
  }

  // Este middleware solo se aplica a las rutas que empiezan por /api/
  if (!path.startsWith('/api/')) {
    return
  }

  // Obtenemos la cabecera de autorización
  const authHeader = getRequestHeader(event, 'Authorization')

  // Si no hay cabecera, no hacemos nada y dejamos que la ruta decida
  if (!authHeader) {
    return
  }

  // Extraemos el token (formato "Bearer <token>")
  const token = authHeader.split(' ')[1]
  if (!token) {
    return
  }

  // Usamos el JWT_SECRET de la configuración de Nuxt
  const config = useRuntimeConfig(event)

  try {
    // Verificamos el token
    const decoded = verify(token, config.jwtSecret)

    // Si es válido, adjuntamos el payload del token al contexto del evento
    // `getUserSession` buscará aquí automáticamente
    event.context.user = decoded
  }
  catch (error) {
    // Si el token es inválido, no hacemos nada.
    // Extraemos el mensaje de error de forma segura para TypeScript
    const errorMessage = error instanceof Error ? error.message : String(error)

    console.error('Token JWT inválido:', errorMessage)
  }
})
