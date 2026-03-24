// server/api/products/index.post.ts
import { db } from '../../db';
import { products } from '../../db/schema';
import { z } from 'zod';

// 1. Definimos el mismo esquema de Zod que usamos en el frontend
const productSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(10),
  price: z.number().positive(),
  type_id: z.number().int(), // Asegúrate de enviar el ID del tipo
  image: z.string().url().optional().or(z.literal('')),
});

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);
  
  if (!session.user || session.user.email !== 'admin@mail.com') {
    throw createError({ statusCode: 401, message: 'No autorizado' });
  }

  const body = await readBody(event);

  // CONVERSIÓN EXPLÍCITA: Forzamos a que sean números antes de validar con Zod
  const payload = {
    ...body,
    price: Number(body.price),
    type_id: Number(body.type_id)
  };

  const result = productSchema.safeParse(payload); // Validamos el payload convertido

  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: 'Datos inválidos',
      data: result.error.format(),
    });
  }

  try {
    const newProduct = await db.insert(products).values({
      name: result.data.name,
      description: result.data.description,
      price: result.data.price,
      type_id: result.data.type_id,
      image: result.data.image || null,
    }).returning();

    return { message: 'Producto creado', product: newProduct[0] };

  } catch (e: any) {
    // TIP: Imprime el error real en tu consola de VS Code para ver qué pasa
    console.error("Error original de la DB:", e);
    
    throw createError({
      statusCode: 500,
      message: e.message || 'Error en la base de datos',
    });
  }
});