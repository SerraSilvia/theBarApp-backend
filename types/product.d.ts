import { z } from 'zod';

// Recreamos el esquema de Zod que se usa en el endpoint de creación
// para asegurar que los tipos coincidan perfectamente.
const productSchema = z.object({
  name: z.string(),
  description: z.string().optional().nullable(),
  ingredients: z.string().optional().nullable(),
  price: z.number(),
  type_id: z.number(),
  image: z.string().optional().nullable(),
});

// Exportamos el tipo inferido por Zod.
// Este será el tipo que usaremos en toda la aplicación (frontend y backend)
// para referirnos a un nuevo producto.
export type NewProduct = z.infer<typeof productSchema>;