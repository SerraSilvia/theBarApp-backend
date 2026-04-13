// server/api/products/index.post.ts
import { db } from '../../db';
import { products } from '../../db/schema';
import { z } from 'zod';

// 1. Esquema de Zod actualizado con 'ingredients' y 'coerce'
const productSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  description: z.string().optional(), // En tu DB era opcional
  ingredients: z.string().optional(), // Añadimos los ingredientes
  // z.coerce fuerza la conversión de string a número automáticamente
  price: z.coerce.number().positive("El precio debe ser mayor a 0"),
  type_id: z.coerce.number().int("El ID de la categoría es requerido"), 
  image: z.string().url().optional().or(z.literal('')),
});

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);
  
  // 2. Usamos la propiedad isAdmin que añadimos a la base de datos
  if (!session.user || session.user.isAdmin !== true) {
    throw createError({ 
      statusCode: 401, 
      message: 'No autorizado. Se requieren permisos de administrador.' 
    });
  }

  const body = await readBody(event);

  // 3. Validamos directamente con Zod (él se encarga de convertir los números)
  const result = productSchema.safeParse(body);

  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: 'Datos inválidos',
      data: result.error.format(),
    });
  }

  try {
    // 4. Insertamos en la DB incluyendo los ingredientes
    const newProduct = await db.insert(products).values({
      name: result.data.name,
      description: result.data.description || null,
      ingredients: result.data.ingredients || null, // Guardamos los ingredientes
      price: result.data.price,
      type_id: result.data.type_id,
      image: result.data.image || null,
    }).returning();

    return { message: 'Producto creado con éxito', product: newProduct[0] };

  } catch (e: any) {
    console.error("Error original de la DB:", e);
    
    throw createError({
      statusCode: 500,
      message: e.message || 'Error interno al guardar en la base de datos',
    });
  }
});