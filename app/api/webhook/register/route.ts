//EventTarget.com/api/webhook/register

import { headers } from "next/headers";
import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  // console.log("---A webhook route starts here. from app api webhook register route.ts");
  
  const WEBHOOKS_SECRET = process.env.WEBHOOKS_SECRET;
  
  if (!WEBHOOKS_SECRET) {
    throw new Error(
      "--Please add wevhook secret in .env , from app api webhook register route.ts"
    );
  }
  
  // console.log("---B webhook route starts here. from app api webhook register route.ts");
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");
  console.log("---C webhook route starts here. from app api webhook register route.ts");
  
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response(
      "Error occured - No Svix headers ::  from app api webhook register route.ts",
      { status: 400 }
    );
  }

  const payload = await request.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOKS_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error(
      "--Error verifying webhook ::  from app api webhook register route.ts.!",
      err
    );
    return new Response(
      "--Error occured ::  from app api webhook register route.ts",
      { status: 400 }
    );
  }

  const { id } = evt.data;
  const eventType = evt.type;

  // console.log(`---Webhook with an ID of--- ${id} and type of--- ${eventType}`);
  // console.log("---Webhook body:", body);
  // console.log("--evt return ::  from app api webhook register route.ts.!", evt);
  // console.log(
  //   "--evt return ::  from app api webhook register route.ts.!",
  //   evt.data
  // );
  // console.log("--evt return ::  from app api webhook register route.ts.!", id);




  // Handling 'user.created' event
  if (eventType === "user.created") {
    try {
      const { email_addresses, primary_email_address_id } = evt.data;
      // log practice
      // console.log("----webhook reg line 72::evt.data--",evt.data);
      // Safely find the primary email address

      const primaryEmail = email_addresses.find(
        (email) => email.id === primary_email_address_id
      );

      // console.log("--- Primary email:--- ", primaryEmail);
      // console.log(" --- Email addresses:--- ", primaryEmail?.email_address);

      if (!primaryEmail) {
        // console.error(" ---No primary email found---");
        return new Response(
          "No Primary email found ::  from app api webhook register route.ts.! ",
          { status: 400 }
        );
      }

      // console.log(" ---create a user in neaon db webhook reg::---");
      // create a user in neaon (postgresql)

      const newUser = await prisma.user.create({
        data: {
          id: evt.data.id!,
          email: primaryEmail.email_address,
          isSubsribed: false,   // Default setting
        },
      });
      // console.log("---New User Created.!", newUser);
    } catch (err) {
      console.error(
        "-- Err in cerating user in db ::  from app api webhook register route.ts.!",
        err
      );

      return new Response(
        "-- Err in cerating user in db ::  from app api webhook register route.ts.! ",
        { status: 500 }
      );
    }
  }

  return new Response("Wevhook received successfully", { status: 200 });
}
