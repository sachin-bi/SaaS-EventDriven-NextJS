"use client";

import { useUser } from '@clerk/nextjs';
import { Todo } from '@prisma/client';
import { log } from 'console';
import React, { useCallback, useEffect, useState } from 'react'
import { useDebounceValue } from 'usehooks-ts';


function Dashboard() {
    const { user } = useUser()
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
        <div>

        </div>
    )
}

export default Dashboard
