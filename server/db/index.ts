import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import config from "../../drizzle.config";
import * as schema from "./schema";

const client = createClient({ 
  url: 'file:./.data/sqlite.db' 
});
export const db = drizzle(client, { schema });
