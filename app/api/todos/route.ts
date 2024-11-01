import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

const ITEMS_PER_PAGE = 10;

export async function GET(requset: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      {
        error: "-- user not authenticated!! :: from sub/route",
      },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(requset.url);
  const page = parseInt(searchParams.get("page") || "1");
  const search = searchParams.get("search") || "";

  try {
    const todos = await prisma.todo.findMany({
      where: {
        userId,
        title: {
          contains: search,
          mode: "insensitive",
        },
      },
      orderBy: { createdAt: "desc" },
      take: ITEMS_PER_PAGE,
      skip: (page - 1) * ITEMS_PER_PAGE,
    });

    const totalItems = await prisma.todo.count({
      where: {
        userId,
        title: {
          contains: search,
          mode: "insensitive",
        },
      },
    });

    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    return NextResponse.json({
      todos,
      currentPage: page,
      totalPages,
    }, { status: 200 });

    //
  } catch (err) {
    console.error(`-- Err :: from todos/route:: ${err}`);
    return NextResponse.json(
      {
        error: `-- Err :: from todos/route:: ${err}`,
      },
      { status: 500 }
    );
  }
}
////////////////   //////////////    ////////////////////    ///////////////   ///////////////    ///////////////
// adding a new todo
export async function POST(requset: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      {
        error: "-- user not authenticated!! :: from sub/route",
      },
      { status: 401 }
    );
  }

  //it gets all the array/todos of that particular user  - basically it performs join operations.
  // should return array to all todos
  try {

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { todos: true },
    });

    // console.log("-- :: from POST todos/route  ::userid", userId);
    // console.log("-- :: from POST todos/route user:: ", user);

    if (!user) {
      return NextResponse.json(
        {
          error: "-- user not found!! :: from todos/route",
        },
        { status: 404 }
      );
    }

    if (!user.isSubsribed && user.todos.length >= 3) {
      console.log("Free users can only create upto 3 todos. Please susbcribe to our paid plans to write more awesome todos")
      return NextResponse.json(
        {
          error:
            "Free users can only create upto 3 todos. Please susbcribe to our paid plans to write more awesome todos",
        },
        { status: 403 }
      );
    }

    const { title } = await requset.json();
    const todo = await prisma.todo.create({
      data: {
        title,
        userId,
      },
    });

    return NextResponse.json(todo, { status: 201 });
  } catch (err) {
    console.error(`-- Err :: from POST sub/route:: ${err}`);
    return NextResponse.json(
      {
        error: `-- Err :: from POST sub/route:: ${err}`,
      },
      { status: 500 }
    );
  }
}
