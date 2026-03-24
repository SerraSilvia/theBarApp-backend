// server/api/products/index.get.ts
import { db } from '../../db'; 

export default defineEventHandler(async (event) => {
  try {
    // Obtenemos todos los productos de la base de datos
    const products = await db.query.products.findMany({
      // Incluimos la información del tipo de producto en la consulta
      with: {
        type: true,
      },
    });

    if (!products) {
      throw createError({
        statusCode: 404,
        statusMessage: 'No se encontraron productos',
      });
    }

    return products;
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: `Error al obtener los productos: ${error.message}`,
    });
  }
});