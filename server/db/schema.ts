import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull(),
  login: text("login"),
  password: text("password"),
});

/* Tabla para las categorías de la carta (ej. Cócteles Clásicos, Sin Alcohol, Cervezas) */
export const product_types = sqliteTable("product_types", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
});

/* Tabla para los CÓCTELES y bebidas de la carta */
export const products = sqliteTable("products", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  type_id: integer("type_id").references(() => product_types.id),
  price: real("price").notNull(),
  description: text("description"),
  ingredients: text("ingredients"),
  image: text("image"), 
});

/* Tabla para los estados de los pedidos (ej. "Pendiente", "Preparando", "Servido") */
export const order_statuses = sqliteTable("order_statuses", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
});

/* Tabla para los pedidos de las mesas/clientes */
export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey(),
  
  // FOREIGN KEY: Enlaza el pedido con el cliente que lo hizo
  user_id: integer("user_id").references(() => users.id),
  
  order_date: integer("order_date", { mode: 'timestamp' }).notNull(),
  
  // FOREIGN KEY: Enlaza el pedido con su estado actual
  status_id: integer("status_id").references(() => order_statuses.id),
});

/* Tabla para los artículos de un pedido (la comanda) */
export const order_items = sqliteTable("order_items", {
  id: integer("id").primaryKey(),
  
  // FOREIGN KEY: Enlaza este artículo con la factura/pedido al que pertenece
  order_id: integer("order_id").references(() => orders.id),
  
  // FOREIGN KEY: Enlaza este artículo con el cóctel que se está pidiendo
  product_id: integer("product_id").references(() => products.id),
  
  quantity: integer("quantity").notNull().default(1),
});

// --- Definición de relaciones (Para consultas con Prisma-like sintaxis) ---

export const productRelations = relations(products, ({ one }) => ({
  type: one(product_types, {
    fields: [products.type_id],
    references: [product_types.id],
  }),
}));

export const orderRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.user_id],
    references: [users.id],
  }),
  status: one(order_statuses, {
    fields: [orders.status_id],
    references: [order_statuses.id],
  }),
  items: many(order_items),
}));

export const orderItemRelations = relations(order_items, ({ one }) => ({
  order: one(orders, {
    fields: [order_items.order_id],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [order_items.product_id],
    references: [products.id],
  }),
}));

export const userRelations = relations(users, ({ many }) => ({
  orders: many(orders),
}));