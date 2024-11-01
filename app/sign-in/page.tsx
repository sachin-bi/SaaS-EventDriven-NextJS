
'use client'
import { useSignIn } from '@clerk/nextjs'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"


import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react';


function Signin() {

    const [showPassword, setShowPassword] = useState(false)

    const [error, setError] = useState("")
    const [emailAddress, setEmailAddress] = useState('')
    const [password, setPassword] = useState('')
    const { isLoaded, signIn, setActive } = useSignIn()
    const router = useRouter()

    if (!isLoaded) {
        // return (<p>Loading...</p>)
        return null;
    }

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        
        if (!isLoaded) {
            return (<p>Loading...</p>)
        }
        try {

            const result = await signIn.create({
                identifier: emailAddress, password
            })

            if (result.status === "complete") {
                await setActive({ session: result.createdSessionId })
                router.push("/dashboard")

            }
            else {
                console.log('--@sign in page submit fn', JSON.stringify(result, null, 2));

            }
        } catch (err: any) {
            console.log('--err in submit fn signin page.tsx::', JSON.stringify(err, null, 2));
            setError(err.errors[0].message)
        }

    }


    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">
                        Sign In to Todo Master
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={submit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                type="email"
                                id="email"
                                value={emailAddress}
                                onChange={(e) => setEmailAddress(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4 text-gray-500" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-gray-500" />
                                    )}
                                </button>
                            </div>
                        </div>
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        <Button type="submit" className="w-full">
                            Sign In
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="justify-center">
                    <p className="text-sm text-muted-foreground">
                        Don&apos;t have an account?{" "}
                        <Link
                            href="/sign-up"
                            className="font-medium text-primary hover:underline"
                        >
                            Sign up
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}

export default Signin
