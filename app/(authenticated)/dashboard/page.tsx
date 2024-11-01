"use client";

// import { useToast } from "@/hooks/use-toast";
import { useCallback, useEffect, useState } from "react";
import { TodoItem } from "@/components/TodoItem";
import { TodoForm } from "@/components/TodoForm";
import { Todo } from "@prisma/client";
import { useUser } from "@clerk/nextjs";
import { AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/Pagination";
import Link from "next/link";
import { useDebounceValue } from "usehooks-ts";



export default function Dashboard() {
    const { user } = useUser();
    const [todos, setTodos] = useState<Todo[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [loading, setLoading] = useState(false)
    const [totalPages, setTotalPages] = useState(1)
    const [currentPage, setCurrentPage] = useState(1)
    const [isSubscribed, setIsSubscribed] = useState(false)

    // using https://usehooks-ts.com/introduction
    const [debounceSearchTerm] = useDebounceValue(searchTerm, 400)

    const fetchTodos = useCallback(async (page: number) => {
        try {
            setLoading(true)
            // can use axios
            const response = await fetch(`/api/todos?page=${page}&search=${debounceSearchTerm}`)

            if (!response.ok) {
                throw new Error("--Failed to fetch todos :: from dashboard/page")
                // here toast can be used to tell user what just happened
            }

            const data = await response.json()
            setTodos(data.todos)
            setTotalPages(data.totalPages);
            setCurrentPage(data.currentPage)


        } catch (err) {
            console.error("--- Err in dashboard page.!", err);

        }
        finally {
            setLoading(false)
        }
    }, [debounceSearchTerm])

    useEffect(() => {
        fetchTodos(1)   // will run the function , will find page 1
        fetchSubsriptionStatus()
    }, [])

    const fetchSubsriptionStatus = async () => {
        const response = await fetch("/api/subscription")
        if (response.ok) {
            // throw new Error("--Failed to fetch todos :: from dashboard/page")
            // here toast can be used to tell user what just happened

            const data = await response.json()
            setIsSubscribed(data.isSubscribed)
        }
    }

    const handleAddTodo = async (title: string) => {
        try {
            const response = await fetch("/api/todos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title })
            })
            if (!response.ok) {
                throw new Error('---failed to add todo::handleAddTodo fn @dashboard/page')
            }

            // after post a todo update the current page
            await fetchTodos(currentPage)

        } catch (err) {
            console.log('---failed to add todo::handleAddTodo fn @dashboard/page', err)
            // toast err occured
        }
    }

    const handleUpdateTodo = async (id: string, completed: boolean) => {
        try {
            const response = await fetch(`/api/todos/${id}`, {
                method: 'PUT',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ completed })
            });

            if (!response.ok) {
                throw new Error("--Failed to update todo :: fn handleUpdateTodo from dashboard/page")
                // here toast can be used to tell user what just happened
            }
            await fetchTodos(currentPage)

        } catch (err) {
            console.log('---failed to add todo::handleupdateTodo fn @dashboard/page', err)
            // toast err occured
        }

    }

    const handleDeleteTodo = async (id: string) => {

        try {
            const response = await fetch(`/api/todo/${id}`, {
                method: "DELETE",
            })
            if (!response.ok) {
                throw new Error("--Failed to update todo :: fn handleDeleteTodo from dashboard/page")
                // here toast can be used to tell user what just happened
            }
            await fetchTodos(currentPage)

        } catch (err) {
            console.log('---failed to add todo::handleDeleteTodo fn @dashboard/page', err)
            // toast err occured
        }
    }
    return (
        <div className="container mx-auto p-4 max-w-3xl mb-8">
            <h1 className="text-3xl font-bold mb-8 text-center">
                Welcome, {user?.emailAddresses[0].emailAddress}!
            </h1>
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Add New Todo</CardTitle>
                </CardHeader>
                <CardContent>
                    <TodoForm onSubmit={(title) => handleAddTodo(title)} />
                </CardContent>
            </Card>
            {!isSubscribed && todos.length >= 3 && (
                <Alert variant="destructive" className="mb-8">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        You&apos;ve reached the maximum number of free todos.{" "}
                        <Link href="/subscribe" className="font-medium underline">
                            Subscribe now
                        </Link>{" "}
                        to add more.
                    </AlertDescription>
                </Alert>
            )}
            <Card>
                <CardHeader>
                    <CardTitle>Your Todos</CardTitle>
                </CardHeader>
                <CardContent>
                    <Input
                        type="text"
                        placeholder="Search todos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="mb-4"
                    />
                    {loading ? (
                        <p className="text-center text-muted-foreground">
                            Loading your todos...
                        </p>
                    ) : todos.length === 0 ? (
                        <p className="text-center text-muted-foreground">
                            You don&apos;t have any todos yet. Add one above!
                        </p>
                    ) : (
                        <>
                            <ul className="space-y-4">
                                {todos.map((todo: Todo) => (
                                    <TodoItem
                                        key={todo.id}
                                        todo={todo}
                                        onUpdate={handleUpdateTodo}
                                        onDelete={handleDeleteTodo}
                                    />
                                ))}
                            </ul>
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={(page) => fetchTodos(page)}
                            />
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );

}

