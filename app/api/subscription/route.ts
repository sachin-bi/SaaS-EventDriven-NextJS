import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";


export async function POST(requset: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      {
        error: "-- user not authenticated!! :: from sub/route",
      },
      { status: 401 }
    );
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json(
        {
          error: "-- User not found!! :: from sub/route",
        },
        { status: 401 }
      );
    }
    //TODO: capture payment, eg. using razorpay, etc

    const subscriptionEnds = new Date();
    subscriptionEnds.setMonth(subscriptionEnds.getMonth() + 1);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isSubsribed: true,
        subscriptionEnds: subscriptionEnds,
      },
    });

    return NextResponse.json(
      {
        message: "-- Subsription successfully :: from sub/route",
        subscriptionEnds: updatedUser.subscriptionEnds,
      },
      { status: 200 }
    );
    } catch (err) {
      console.error(`-- Err :: from sub/route:: ${err}`);
      return NextResponse.json(
        {
          error: `-- Err :: from sub/route:: ${err}`,
        },
        { status: 500 }
      );
    }
}

//////    ///////     ///////   ////////     /////////   ///////

export async function GET(requset: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      {
        error: "-- User unauthorized!! :: from sub/route GET",
      },
      { status: 401 }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscriptionEnds: true,
        isSubsribed: true,
      },
    });
    if (!user) {
      return NextResponse.json(
        {
          error: "-- User not found!! :: from sub/route",
        },
        { status: 401 }
      );
    }

    const now = new Date();

    if (user.subscriptionEnds && user.subscriptionEnds < now) {
      // const updatedUser =
      await prisma.user.update({
        where: { id: userId },
        data: {
          isSubsribed: false,
          subscriptionEnds: null,
        },
      });
      return NextResponse.json(
        {
          isSubscribed: false,
          subscriptionEnds: null,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        isSubscribed: true,
        subscriptionEnds: user.subscriptionEnds,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error(`-- Err :: from GET sub/route:: ${err}`);
    return NextResponse.json(
      {
        error: `-- Err :: from GET sub/route:: ${err}`,
      },
      { status: 500 }
    );
  }
}
