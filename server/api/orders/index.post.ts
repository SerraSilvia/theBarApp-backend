// server/api/orders/index.post.ts
import { and, eq } from 'drizzle-orm';
import { db } from '../../db';
import * as schema from '../../db/schema';

export default defineEventHandler(async (event) => {
  // 1. Seguridad: Proteger el endpoint
  const session = await requireUserSession(event);
  const userId = Number(session.user.id);

  // 2. Validar el cuerpo de la petición (el producto que se quiere añadir)
  const { productId, quantity } = await readBody(event);
  if (!productId || !quantity || quantity <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Se requiere un ID de producto y una cantidad válida.',
    });
  }

  try {
    // 3. Buscar el estado "Pendiente"
    const pendingStatus = await db.query.order_statuses.findFirst({
      where: eq(schema.order_statuses.name, 'Pendiente'),
    });
    if (!pendingStatus) {
      throw createError({ statusCode: 500, statusMessage: 'El estado "Pendiente" no se encuentra en la base de datos.' });
    }

    // 4. Buscar un carrito activo (un pedido "Pendiente") para el usuario
    let activeCart = await db.query.orders.findFirst({
      where: and(
        eq(schema.orders.user_id, userId),
        eq(schema.orders.status_id, pendingStatus.id)
      ),
    });

    // 5. Si no hay carrito activo, crear uno nuevo
    if (!activeCart) {
      console.log(`🛒 Creando nuevo carrito para el usuario ${userId}`);
      const newOrder = await db.insert(schema.orders).values({
        user_id: userId,
        status_id: pendingStatus.id,
        order_date: new Date(),
      }).returning();
      activeCart = newOrder[0];
    }

    // 6. Comprobar si el producto ya está en el carrito
    const existingItem = await db.query.order_items.findFirst({
      where: and(
        eq(schema.order_items.order_id, activeCart.id),
        eq(schema.order_items.product_id, productId)
      ),
    });

    let updatedItem;
    if (existingItem) {
      // Si ya existe, actualizar la cantidad
      console.log(`🔄 Actualizando cantidad para el producto ${productId} en el carrito ${activeCart.id}`);
      const newQuantity = existingItem.quantity + quantity;
      updatedItem = await db.update(schema.order_items)
        .set({ quantity: newQuantity })
        .where(eq(schema.order_items.id, existingItem.id))
        .returning();
    } else {
      // Si no existe, crear un nuevo artículo en el pedido
      console.log(`➕ Añadiendo nuevo producto ${productId} al carrito ${activeCart.id}`);
      updatedItem = await db.insert(schema.order_items).values({
        order_id: activeCart.id,
        product_id: productId,
        quantity: quantity,
      }).returning();
    }

    return {
      message: 'Producto añadido al carrito con éxito',
      cartId: activeCart.id,
      item: updatedItem[0],
    };

  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: `Error al añadir al carrito: ${error.message}`,
    });
  }
});