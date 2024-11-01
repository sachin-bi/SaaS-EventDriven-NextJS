import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

// done:  make PUT & DELETE for individual todos..
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "--Unauthorized" }, { status: 401 });
  }

  try {
    const { completed } = await req.json();
    const todoId = params.id;

    const todo = await prisma.todo.findUnique({
      where: { id: todoId },
    });

    if (!todo) {
      return NextResponse.json({ error: "--Todo not found" }, { status: 404 });
    }

    if (todo.userId !== userId) {
      return NextResponse.json({ error: "--Forbidden" }, { status: 403 });
    }

    const updatedTodo = await prisma.todo.update({
      where: { id: todoId },
      data: { completed },
    });

    return NextResponse.json(updatedTodo);
  } catch (error) {
    return NextResponse.json(
      { error: "--Internal Server Error" },
      { status: 500 }
    );
  }
}

/////////////////////////////////////////////////////////////////////////////////////

//api/todos/sdggt -> we need sdggt
// {params}:{params: {id:string}  -> {<variable>}:{<ts-dataType>}

export async function DELETE(
  requset: NextRequest,
  {params}: { params: { id: string } }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      {
        error: "-- user not authenticated!! :: from todos/id/route",
      },
      { status: 401 }
    );
  }

  try {
    const todoId = params.id; 
    const todo = await prisma.todo.findUnique({
      where: { id: todoId },
    });

    if (!todo) {
      return NextResponse.json(
        {
          error: "-- Todo Not Found :: from todos/id/route",
        },
        { status: 404 }
      );
    }

    if (todo.userId !== userId) {
      return NextResponse.json(
        {
          error: "-- Forbidden Todo .! :: from todos/id/route",
        },
        { status: 403 }
      );
    }

    await prisma.todo.delete({
      where: { id: todoId },
    });

    return NextResponse.json(
      {
        message: "-- Todo Deleted Successfully :: from todos/id/route",
      },
      { status: 200 }
    );
  } catch (err) {
    console.error(`-- Err :: todos/id/route:: ${err}`);
    return NextResponse.json(
      {
        error: `-- Err :: todos/id/route:: ${err}`,
      },
      { status: 500 }
    );
  }
}
