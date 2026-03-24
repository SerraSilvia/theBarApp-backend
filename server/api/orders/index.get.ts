// server/api/orders/index.get.ts
import { eq } from 'drizzle-orm';
import { db } from '../../db';
import { orders } from '../../db/schema';

export default defineEventHandler(async (event) => {
  // 1. Seguridad: Verificar la sesión del usuario.
  const session = await requireUserSession(event);

  // Asegurarnos de que el ID del usuario es un número
  const userId = Number(session.user.id);

  // Si por alguna razón la conversión falla, lanzamos un error.
  if (isNaN(userId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID de usuario inválido',
    });
  }

  try {
    // 2. Obtener solo los pedidos del usuario autenticado.
    const userOrders = await db.query.orders.findMany({
      // Usamos el ID convertido a número en la comparación
      where: eq(orders.user_id, userId),
      // Incluimos datos relacionados para mostrar en el frontend
      with: {
        status: true, // El estado del pedido (ej. "Enviado")
        items: {      // Los artículos de cada pedido
          with: {
            product: true // Los detalles de cada producto
          }
        }
      },
      orderBy: (orders, { desc }) => [desc(orders.order_date)], // Mostrar los más recientes primero
    });

    return userOrders;

  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: `Error al obtener los pedidos: ${error.message}`,
    });
  }
});