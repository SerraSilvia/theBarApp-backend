import { eq } from 'drizzle-orm'
import { db } from './index'
import { products } from './schema'
import type { NewProduct } from '../../types/product'

export async function updateProduct(id: number, data: NewProduct) {
  const [updatedProduct] = await db
    .update(products)
    .set(data)
    .where(eq(products.id, id))
    .returning()
  return updatedProduct
}

export async function deleteProduct(id: number) {
  await db.delete(products).where(eq(products.id, id))
}
