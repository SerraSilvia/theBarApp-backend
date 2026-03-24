// server/api/products/[id].get.ts
import { eq } from 'drizzle-orm';
import { products } from '../../db/schema'; 
import { db } from '../../db'; 

export default defineEventHandler(async (event) => {
  // Obtenemos el 'id' de los parámetros de la ruta
  const productId = getRouterParam(event, 'id');

  if (!productId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID de producto no proporcionado',
    });
  }

  try {
    // Buscamos el producto específico por su ID
    const product = await db.query.products.findFirst({
      where: eq(products.id, Number(productId)),
      // Incluimos también la información del tipo de producto
      with: {
        type: true,
      },
    });

    if (!product) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Producto no encontrado',
      });
    }

    return product;
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: `Error al obtener el producto: ${error.message}`,
    });
  }
});