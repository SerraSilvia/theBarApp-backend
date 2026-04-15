import { z } from 'zod'
import { updateProduct } from '../../db/queries'

const productSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  description: z.string().optional(),
  ingredients: z.string().optional(),
  price: z.coerce.number().positive('El precio debe ser mayor a 0'),
  type_id: z.coerce.number().int('El ID de la categoría es requerido'),
  image: z.string().url().optional().or(z.literal('')),
})

export default defineEventHandler(async (event) => {
  const user = event.context.user
  if (!user?.isAdmin) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const productId = Number(event.context.params?.id)
  if (isNaN(productId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid product ID' })
  }

  const body = await readBody(event)
  const validation = productSchema.safeParse(body)

  if (!validation.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid product data',
      data: validation.error.format(),
    })
  }

  try {
    const updatedProduct = await updateProduct(productId, validation.data)
    return { product: updatedProduct }
  } catch (error: any) {
    console.error('Error updating product:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Error updating product',
    })
  }
})
