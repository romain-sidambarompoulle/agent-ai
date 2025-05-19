import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient().$extends({
    result: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      flow: { json: { needs: { json: true }, compute: (f) => f.json as any } },
    },
  });
};

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
 
const globalForPrisma = globalThis as unknown as { prisma: ReturnType<typeof prismaClientSingleton> | undefined };

export const prisma =
  globalForPrisma.prisma ??
  prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;