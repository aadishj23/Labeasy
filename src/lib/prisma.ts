import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

// Prisma 7 connects through a driver adapter. Managed Postgres (e.g. Aiven)
// serves a CA that node-postgres won't trust by default, so for remote hosts we
// enable TLS but skip CA verification. We strip `sslmode` from the URL so our
// explicit `ssl` config isn't overridden by the connection string.
function buildAdapter() {
  const raw = process.env.DATABASE_URL || "";
  let connectionString = raw;
  let ssl: { rejectUnauthorized: boolean } | undefined;
  try {
    const url = new URL(raw);
    const isLocal =
      url.hostname === "localhost" || url.hostname === "127.0.0.1";
    if (!isLocal) {
      url.searchParams.delete("sslmode");
      connectionString = url.toString();
      ssl = { rejectUnauthorized: false };
    }
  } catch {
    /* leave connectionString as-is */
  }
  return new PrismaPg({ connectionString, ...(ssl ? { ssl } : {}) });
}

const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter: buildAdapter() });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
