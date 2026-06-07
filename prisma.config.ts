import "dotenv/config";
import { defineConfig } from "prisma/config";

// Prisma 7 moved the connection URL for CLI commands (migrate / generate /
// introspect) out of schema.prisma into here. When this file exists, Prisma no
// longer auto-loads .env, so we load it explicitly above.
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
