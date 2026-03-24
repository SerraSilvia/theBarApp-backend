// server/api/orders/[id].get.ts
import { and, eq } from 'drizzle-orm';
import { db } from '../../db';
import { orders } from '../../db/schema';

export default defineEventHandler(async (event) => {
  // 1. Seguridad: Proteger el endpoint y obtener el ID del usuario
  const session = await requireUserSession(event);
  const userId = Number(session.user.id);

  // 2. Obtener el ID del pedido desde la URL
  const orderId = getRouterParam(event, 'id');
  if (!orderId) {
    throw createError({ statusCode: 400, statusMessage: 'ID de pedido no proporcionado' });
  }

  try {
    // 3. Buscar el pedido específico
    const order = await db.query.orders.findFirst({
      // La condición es crucial: el ID del pedido debe coincidir Y el pedido debe pertenecer al usuario logueado.
      where: and(
        eq(orders.id, Number(orderId)),
        eq(orders.user_id, userId)
      ),
      with: {
        status: true,
        items: {
          with: {
            product: true,
          },
        },
      },
    });

    // 4. Si no se encuentra el pedido (o no pertenece al usuario), devolver un 404
    if (!order) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Pedido no encontrado',
      });
    }

    return order;

  } catch (error: any) {
    // Manejar errores de 404 lanzados explícitamente
    if (error.statusCode === 404) throw error;
    
    throw createError({
      statusCode: 500,
      statusMessage: `Error al obtener el pedido: ${error.message}`,
    });
  }
});