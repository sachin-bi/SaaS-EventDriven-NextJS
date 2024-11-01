// import { authMiddleware } from '@clerk/nextjs/server'    //depricreated...
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";


const isPublicRoute = createRouteMatcher([
  "/",
  "/api/webhook/register",
  "/sign-up",
  "/sign-in",
]);

export default clerkMiddleware(async (auth, request) => {
  
  const { userId } = await auth();

  // console.log("----A Clerk Middleware userID:.",userId);

  // Handle unauthenticated users trying to access protected routes

  if (!isPublicRoute(request) && !userId) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
    // return redirectToSignIn();
    // await auth.protect(); //stops and protects the route
  }
  try {
    if (userId) {
      // console.log("---- B. Clerk Middleware user::."); //TODO: error here!!

      // const user = await currentUser();
      // const user = await clerkClient.users.getUser(auth.userId); // Fetch user data from Clerk

      const client = await clerkClient();
      const user = await client.users?.getUser(userId);

      // console.log("---- C. Clerk Middleware user::.",user);

      if (!user) {
        console.log("-- currentUser not found.! @mw.ts, user::", user);

        return NextResponse.redirect(new URL("/usernotfound", request.url));
      }
      const role = user?.publicMetadata.role as string | undefined; //role is ur property so no suggestions

      //admin role redirection
      if (role === "admin" && request.nextUrl.pathname === "/dashboard") {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }

      //prevent non admin user to access the admin routes
      if (role !== "admin" && request.nextUrl.pathname.startsWith("/admin")) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }

      //redirect auth user trying to access public routes
      if (isPublicRoute(request)) {
        return NextResponse.redirect(
          new URL(
            role === "admin" ? "/admin/dashboard" : "dashboard",
            request.url
          )
        );
      }
    }
  } catch (err) {
    console.error("--- err from mw.ts", err);
    return NextResponse.redirect(new URL("/error", request.url));
  }
});

export const config = {
  matcher: [
    "/",                    // Home route
    "/((?!_next|favicon.ico).*)" // All other routes, excluding Next.js internals and static assets
  ],
};
// export const config = {
//   matcher: [
//     // Skip Next.js internals and all static files, unless found in search params
//     "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
//     // Always run for API routes
//     "/(api|trpc)(.*)",
//   ],
// };
