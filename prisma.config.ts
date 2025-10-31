import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "src/infrastructure/prisma/schema.prisma",
  migrations: {
    path: "src/infrastructure/prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: process.env.DATABASE_URL || "file:./dev.db",
  },
});
