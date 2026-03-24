// server/api/orders/[id].put.ts
import { and, eq } from 'drizzle-orm';
import { db } from '../../db';
import * as schema from '../../db/schema';

export default defineEventHandler(async (event) => {
  // 1. Seguridad y IDs
  const session = await requireUserSession(event);
  const userId = Number(session.user.id);
  const orderId = getRouterParam(event, 'id');
  if (!orderId) {
    throw createError({ statusCode: 400, statusMessage: 'ID de pedido no proporcionado' });
  }

  // 2. Leer el cuerpo de la petición para saber qué actualizar
  const { statusName } = await readBody(event);
  if (!statusName) {
    throw createError({ statusCode: 400, statusMessage: 'Nuevo estado no proporcionado' });
  }

  try {
    // 3. Buscar el nuevo estado en la BD (ej. "Procesando")
    const newStatus = await db.query.order_statuses.findFirst({
      where: eq(schema.order_statuses.name, statusName),
    });
    if (!newStatus) {
      throw createError({ statusCode: 404, statusMessage: `Estado "${statusName}" no encontrado.` });
    }

    // 4. Actualizar el pedido
    // Drizzle no tiene un `update().where(...).returning()` directo en una sola línea para SQLite.
    // Lo hacemos en dos pasos: actualizar y luego obtener el resultado.
    
    // Paso 4.1: Actualizar
    const result = await db.update(schema.orders)
      .set({ status_id: newStatus.id })
      .where(and(
        eq(schema.orders.id, Number(orderId)),
        eq(schema.orders.user_id, userId) // ¡Seguridad! Solo actualizar si el pedido es del usuario
      ));

    // Si result.rowsAffected es 0, significa que no se encontró el pedido o no pertenecía al usuario.
    if (result.rowsAffected === 0) {
        throw createError({ statusCode: 404, statusMessage: 'Pedido no encontrado o no autorizado para modificar.' });
    }

    // Paso 4.2: Obtener el pedido actualizado para devolverlo
    const updatedOrder = await db.query.orders.findFirst({
        where: eq(schema.orders.id, Number(orderId)),
        with: { status: true }
    });

    return {
      message: 'Pedido actualizado con éxito',
      order: updatedOrder,
    };

  } catch (error: any) {
    if (error.statusCode === 404) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: `Error al actualizar el pedido: ${error.message}`,
    });
  }
});