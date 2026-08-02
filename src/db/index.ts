import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const rawUrl = process.env.TURSO_DATABASE_URL || "file:local.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

// If a Turso libsql:// URL is set but no Auth Token is provided, fallback to local sqlite file to avoid connection authorization errors.
const isRemoteWithoutToken = rawUrl.startsWith("libsql://") && !authToken;
const url = isRemoteWithoutToken ? "file:local.db" : rawUrl;

export const client = createClient({
  url,
  authToken: authToken || undefined,
});

export const db = drizzle(client, { schema });
