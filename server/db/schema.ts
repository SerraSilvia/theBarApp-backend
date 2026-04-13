import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// 1. Usuarios (con campo isAdmin para el control de permisos)
export const users = sqliteTable("users", {
  id: integer("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull(),
  login: text("login"),
  password: text("password"),
  isAdmin: integer("is_admin", { mode: "boolean" }).default(false),
});

// 2. Categorías
export const product_types = sqliteTable("product_types", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
});

// 3. Productos (con la referencia a type_id restaurada)
export const products = sqliteTable("products", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  type_id: integer("type_id").references(() => product_types.id),
  price: real("price").notNull(),
  description: text("description"),
  ingredients: text("ingredients"),
  image: text("image"), 
});

// --- Relaciones ---

// Mantenemos la relación para poder hacer queries tipo "obtener producto con su categoría"
export const productRelations = relations(products, ({ one }) => ({
  type: one(product_types, {
    fields: [products.type_id],
    references: [product_types.id],
  }),
}));

// Relación inversa (opcional, para sacar todos los productos de una categoría)
export const productTypeRelations = relations(product_types, ({ many }) => ({
  products: many(products),
}));