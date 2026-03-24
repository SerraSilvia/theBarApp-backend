// server/api/orders/[id].delete.ts
import { and, eq } from 'drizzle-orm';
import { db } from '../../db';
import { orders, order_items } from '../../db/schema';

export default defineEventHandler(async (event) => {
  // 1. Seguridad y IDs
  const session = await requireUserSession(event);
  const userId = Number(session.user.id);
  const orderId = getRouterParam(event, 'id');
  if (!orderId) {
    throw createError({ statusCode: 400, statusMessage: 'ID de pedido no proporcionado' });
  }

  try {
    // Para eliminar un pedido, primero debemos eliminar sus dependencias (los artículos del pedido).
    // Drizzle no soporta "ON DELETE CASCADE" en el ORM, así que lo hacemos manualmente.

    // 2. Verificar que el pedido pertenece al usuario antes de hacer nada
    const orderToDelete = await db.query.orders.findFirst({
        where: and(
            eq(orders.id, Number(orderId)),
            eq(orders.user_id, userId)
        )
    });

    if (!orderToDelete) {
        throw createError({ statusCode: 404, statusMessage: 'Pedido no encontrado o no autorizado para eliminar.' });
    }

    // 3. Eliminar los artículos asociados al pedido
    await db.delete(order_items).where(eq(order_items.order_id, Number(orderId)));

    // 4. Eliminar el pedido principal
    await db.delete(orders).where(eq(orders.id, Number(orderId)));

    return {
      message: `Pedido #${orderId} eliminado con éxito.`,
    };

  } catch (error: any) {
    if (error.statusCode === 404) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: `Error al eliminar el pedido: ${error.message}`,
    });
  }
});