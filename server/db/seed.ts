// server/db/seed.ts
import { db } from "./index";
import {
  users,
  product_types,
  products,
} from "./schema";
import { hash } from "bcrypt"; // Utilitzarem bcrypt per encriptar la contrasenya

async function seed() {
  try {
    console.log("🍹 Començant el seeder de La Cocteleria...");
    
    // 1. Netejar taules existents (Només les que queden)
    console.log("🗑️ Netejant la base de dades...");
    await db.delete(products);
    await db.delete(product_types);
    await db.delete(users);

    console.log("✨ Base de dades neta.");

   // 2. Inserir tipus de producte (Només dues categories)
    console.log("🏷️ Inserint categories (0: Amb Alcohol, 1: Sense Alcohol)...");
    const productTypesData = [
      { name: "Amb Alcohol" },   // ID 1 (Índex 0)
      { name: "Sense Alcohol" }, // ID 2 (Índex 1)
    ];
    const insertedProductTypes = await db
      .insert(product_types)
      .values(productTypesData)
      .returning();
    console.log(`✅ ${insertedProductTypes.length} categories inserides.`);

    // 3. Inserir usuaris (Clients / Staff)
    console.log("👤 Inserint usuaris...");
    const hashedPassword = await hash("12345678", 10);
    const usersData = [
      {
        name: "Silvia Serra",
        email: "silvia.serra@gmail.com",
        login: "silvia.serra",
        password: hashedPassword,
        isAdmin: false, // Usuari normal
      },
      {
        name: "Administrador",
        email: "admin@mail.com",
        login: "admin",
        password: hashedPassword,
        isAdmin: true, // Li donem permisos d'edició
      },
    ];
    const insertedUsers = await db.insert(users).values(usersData).returning();
    console.log(`✅ ${insertedUsers.length} usuaris inserits.`);

    // 4. Inserir els Còctels (Productes) amb imatges
    console.log("🍸 Inserint la carta de còctels amb imatges...");
    const productsData = [
      // --- AMB ALCOHOL (insertedProductTypes[0]) ---
      {
        name: "Mojito Cubà",
        type_id: insertedProductTypes[0]!.id,
        price: 8.50,
        description: "El clàssic refrescant amb un equilibri perfecte entre dolç, cítric i menta.",
        ingredients: "Rom blanc, llima fresca, fulles de menta, sucre morè, soda, gel picat.",
        image: "https://www.thecocktaildb.com/images/media/drink/metwgh1606770327.jpg"
      },
      {
        name: "Margarita",
        type_id: insertedProductTypes[0]!.id,
        price: 9.00,
        description: "El rei dels còctels mexicans, servit amb la seva icònica vora de sal.",
        ingredients: "Tequila reposat, Cointreau (triple sec), suc de llima fresca, vora de sal.",
        image: "https://www.thecocktaildb.com/images/media/drink/5noda61589575158.jpg"
      },
      {
        name: "Daiquiri de Maduixa",
        type_id: insertedProductTypes[0]!.id,
        price: 9.00,
        description: "L'equilibri perfecte entre el rom i la dolçor natural de la maduixa fresca.",
        ingredients: "Rom blanc, maduixes fresques, suc de llima, xarop de sucre, gel picat.",
        image: "https://www.thecocktaildb.com/images/media/drink/mrz9jt1504361818.jpg"
      },
      {
        name: "Pinya Colada",
        type_id: insertedProductTypes[0]!.id,
        price: 9.50,
        description: "Un viatge tropical a cada glop. Cremós, dolç i molt refrescant.",
        ingredients: "Rom blanc, crema de coco, suc de pinya, gel.",
        image: "https://www.thecocktaildb.com/images/media/drink/v0at4y1582483090.jpg"
      },
      {
        name: "Bloody Mary",
        type_id: insertedProductTypes[0]!.id,
        price: 10.00,
        description: "El rei dels còctels salats. Picant, especiat i amb molt de caràcter.",
        ingredients: "Vodka, suc de tomàquet, suc de llimona, salsa Worcestershire, Tabasco, sal d'api.",
        image: "https://www.thecocktaildb.com/images/media/drink/t60z9p1504353589.jpg"
      },
      {
        name: "Blue Lagoon",
        type_id: insertedProductTypes[0]!.id,
        price: 8.50,
        description: "Un còctel vibrant i elèctric amb un toc cítric inconfusible.",
        ingredients: "Vodka, Blue Curaçao, llimonada, gel.",
        image: "https://www.thecocktaildb.com/images/media/drink/68syid1550905132.jpg"
      },
      {
        name: "The Bar Special",
        type_id: insertedProductTypes[0]!.id,
        price: 12.00,
        description: "La nostra creació secreta d'autor. Cítric, floral i fumat.",
        ingredients: "Ginebra prèmium, xarop de violeta, clara d'ou, suc de yuzu, romaní fumat.",
        image: "https://www.thecocktaildb.com/images/media/drink/71t8581504353095.jpg"
      },

      // --- SENSE ALCOHOL (insertedProductTypes[1]) ---
      {
        name: "San Francisco",
        type_id: insertedProductTypes[1]!.id,
        price: 7.00,
        description: "Un clàssic sense alcohol, dolç i molt afruitat.",
        ingredients: "Suc de taronja, llimona, pinya, préssec i granadina.",
        image: "https://www.thecocktaildb.com/images/media/drink/szmj2d1504889961.jpg"
      },
      {
        name: "Shirley Temple",
        type_id: insertedProductTypes[1]!.id,
        price: 6.50,
        description: "El mocktail més famós del món. Bombolles i un toc dolç.",
        ingredients: "Ginger ale, un raig de granadina, cirera confitada.",
        image: "https://www.thecocktaildb.com/images/media/drink/u7a6df1441246184.jpg"
      },
      {
        name: "Mojito Sense Alcohol",
        type_id: insertedProductTypes[1]!.id,
        price: 7.50,
        description: "Tota la frescor del mojito tradicional però apte per a tothom.",
        ingredients: "Llima fresca, menta, sucre morè, Sprite, gel picat.",
        image: "https://www.thecocktaildb.com/images/media/drink/wywvxq1441246182.jpg"
      }
    ];
    
    const insertedProducts = await db
      .insert(products)
      .values(productsData)
      .returning();
    console.log(`✅ ${insertedProducts.length} begudes inserides (Alcohol/Sense Alcohol).`);

    console.log("🍹 Seeder completat amb èxit! La barra està oberta.");
  } catch (error) {
    console.error("❌ Error durant el seeder:", error);
    process.exit(1);
  }
}

seed();