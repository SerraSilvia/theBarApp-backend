import { H3Event } from 'h3'
import { deleteProduct } from '../../db/queries'

export default defineEventHandler(async (event: H3Event) => {
  const session = await getUserSession(event);

  if (!session.user || session.user.isAdmin !== true) {
    throw createError({ 
      statusCode: 401, 
      message: 'No autorizado. Se requieren permisos de administrador.' 
    });
  }

  const productId = Number(event.context.params?.id)
  if (isNaN(productId)) {
    throw createError({ statusCode: 400, statusMessage: 'ID de producto inválido' })
  }

  try {
    await deleteProduct(productId)
    return { statusCode: 204 } // Sin Contenido
  } catch (error) {
    console.error('Error al eliminar el producto:', error)
    throw createError({ statusCode: 500, statusMessage: 'Error al eliminar el producto' })
  }
})
