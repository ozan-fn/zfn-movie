import { PrismaClient } from "@/generated/prisma/client";

// Menghindari error TypeScript karena penambahan properti ke objek global
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

// Inisialisasi Prisma: gunakan yang sudah ada di global atau buat baru
export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        log:
            process.env.NODE_ENV === "development"
                ? [
                      /* "query", "error", "warn" */
                  ]
                : ["error"],
    });

// Jika tidak di production, simpan instance ke global agar tidak dibuat ulang saat HMR
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
