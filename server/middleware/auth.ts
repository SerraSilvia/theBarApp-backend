// server/middleware/auth.ts
import jwt from "jsonwebtoken";

const { verify } = jwt;

export default defineEventHandler(async (event) => {
  // 1. ¡NUEVO! Ignorar las peticiones OPTIONS.
  // El navegador las envía automáticamente antes de peticiones con cabeceras custom.
  // Debemos permitir que nuxt-security las gestione.
  if (event.method === 'OPTIONS') {
    return;
  }

  const path = getRequestPath(event);

  // Ignoramos las rutas de login y registro para que no requieran token
  if (path.startsWith("/api/auth/")) {
    return;
  }

  // Este middleware solo se aplica a las rutas que empiezan por /api/
  if (!path.startsWith("/api/")) {
    return;
  }
  try {
    // Obtenemos la cabecera de autorización
    const authHeader = getRequestHeader(event, "Authorization");
    const token = authHeader?.split(" ")[1];

    // 4. ¡CAMBIO CLAVE! Si no hay token, lanzamos un error 401 inmediatamente.
    if (!token) {
      throw createError({
        statusCode: 401,
        statusMessage: "No se proporcionó token de autenticación.",
      });
    }

    // Usamos el JWT_SECRET de la configuración de Nuxt
    const config = useRuntimeConfig(event);

    // Verificamos el token
    const decoded = verify(token, config.jwtSecret);

    // Si es válido, adjuntamos el payload del token al contexto del evento
    // `getUserSession` buscará aquí automáticamente
    event.context.user = decoded;
    await setUserSession(event, {
      // @ts-ignore
      user: decoded,
    });
  } catch (error) {
    // Si el token es inválido, no hacemos nada.
    // Extraemos el mensaje de error de forma segura para TypeScript
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Error de validación de JWT:', errorMessage)

    throw createError({
      statusCode: 401,
      statusMessage: 'Token inválido o expirado.',
    })
  }
});
