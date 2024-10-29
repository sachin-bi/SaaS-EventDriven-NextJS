// moto - if the connection already exist - don't connect the new one..it'll help db to don't create infinite connection
// eg - https://github.com/prisma/prisma-examples/blob/0ceaaf34646feeaf6bb05893b8be96c59d575642/orm/rest-nextjs-api-routes/src/lib/prisma.ts#L4

import { PrismaClient } from "@prisma/client";

const prismaClinetSignleton = () => {
  return new PrismaClient();
};

// it says that when ever you are creating prismaClinetSignleton - its return type should be prismaClinetSignleton
type prismaClinetSignleton = ReturnType<typeof prismaClinetSignleton>;

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more:
// https://pris.ly/d/help/next-js-best-practices
// checks at global level wether you have instance of connection..!
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// if prebuild connection doesn't exist then only , built new connection
const prisma = globalForPrisma.prisma ?? prismaClinetSignleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
