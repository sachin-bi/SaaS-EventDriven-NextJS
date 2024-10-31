//EventTarget.com/api/webhook/register

import { headers } from "next/headers";
import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  const WEBHOOKS_SECRET = process.env.WEBHOOKS_SECRET;

  if (!WEBHOOKS_SECRET) {
    throw new Error(
      "--Please add wevhook secret in .env , from app api webhook register route.ts"
    );
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response(
      "Error occured - No Svix headers ::  from app api webhook register route.ts"
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

  console.log('--evt return ::  from app api webhook register route.ts.!',evt);
  console.log('--evt return ::  from app api webhook register route.ts.!',evt.data);
  console.log('--evt return ::  from app api webhook register route.ts.!',id);
  

  if (eventType === "user.created") {
    try {
        const {email_addresses, primary_email_address_id} = evt.data
        // log practice

        const primaryEmail = email_addresses.find(
            email => email.id === primary_email_address_id
        )

        if (!primaryEmail) {
            return new Response("No Primary email found ::  from app api webhook register route.ts.! ",{status:400})
        }

        // create a user in neaon (postgresql)

        const newUser = await prisma.user.create({
            data:{
                id: evt.data.id,
                email: primaryEmail.email_address,
                isSubsribed: false
            }
        })
        console.log("New User Created.!", newUser)

         
    } catch (err) {
        console.log('-- Err in cerating user in db ::  from app api webhook register route.ts.!',err);
        
        return new Response("-- Err in cerating user in db ::  from app api webhook register route.ts.! ",{status:400})
        
    }
    
  }

  return new Response('Wevhook received successfully',{status:200});
}

const study =
{
    "data": {
      "birthday": "",
      "created_at": 1654012591514,
      "email_addresses": [
        {
          "email_address": "example@example.org",
          "id": "idn_29w83yL7CwVlJXylYLxcslromF1",
          "linked_to": [],
          "object": "email_address",
          "verification": {
            "status": "verified",
            "strategy": "ticket"
          }
        },
        {
          "email_address": "example2@example.org",
          "id": "idn_29w83yL7CwVlJXylYLxcslromF11",
          "linked_to": [],
          "object": "email_address",
          "verification": {
            "status": "verified",
            "strategy": "ticket"
          }
        }
      ],
      "external_accounts": [],
      "external_id": "567772",
      "first_name": "Example",
      "gender": "",
      "id": "user_29w83sxmDNGwOuEthce5gg56FcC",
      "image_url": "https://img.clerk.com/xxxxxx",
      "last_name": "Example",
      "last_sign_in_at": 1654012591514,
      "object": "user",
      "password_enabled": true,
      "phone_numbers": [],
      "primary_email_address_id": "idn_29w83yL7CwVlJXylYLxcslromF1",
      "primary_phone_number_id": null,
      "primary_web3_wallet_id": null,
      "private_metadata": {},
      "profile_image_url": "https://www.gravatar.com/avatar?d=mp",
      "public_metadata": {},
      "two_factor_enabled": false,
      "unsafe_metadata": {},
      "updated_at": 1654012591835,
      "username": null,
      "web3_wallets": []
    },
    "event_attributes": {
      "http_request": {
        "client_ip": "0.0.0.0",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
      }
    },
    "object": "event",
    "timestamp": 1654012591835,
    "type": "user.created"
  }