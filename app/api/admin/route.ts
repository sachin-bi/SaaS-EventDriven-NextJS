import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

// here - how to verify wether u r admin or not.!
async function isAdmin(userId: string) {
  // await clerkClient.users.getUser(userId)
  const client = await clerkClient();
  const user = await client.users?.getUser(userId);

  return user.privateMetadata.role === "admin";
}
