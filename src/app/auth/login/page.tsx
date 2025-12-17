"use client";

import { useState } from "react";
import Link from "next/link";
import { login, signup } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Mail, Lock, User, Loader2 } from "lucide-react";

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);

        const result = isLogin ? await login(formData) : await signup(formData);

        if (result?.error) {
            setError(result.error);
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#f0fdfa] dark:bg-[#042f2e] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white dark:bg-[#134e4a] rounded-3xl shadow-2xl shadow-teal-100/50 dark:shadow-teal-900/50 p-8 border border-white/50 dark:border-teal-800/50">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-teal-200 dark:shadow-teal-900/20">
                            🗻
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {isLogin ? "Welcome back!" : "Create an account"}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">
                            {isLogin ? "Sign in to your Trip Planner" : "Start planning your adventures"}
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form action={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Full Name"
                                    required={!isLogin}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white placeholder:text-gray-400"
                                />
                            </div>
                        )}

                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="email"
                                name="email"
                                placeholder="Email address"
                                required
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white placeholder:text-gray-400"
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                required
                                minLength={6}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white placeholder:text-gray-400"
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-medium shadow-md shadow-teal-200 dark:shadow-teal-900/20 disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : isLogin ? (
                                "Sign In"
                            ) : (
                                "Create Account"
                            )}
                        </Button>
                    </form>

                    {/* Toggle */}
                    <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                        <button
                            type="button"
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError(null);
                            }}
                            className="text-teal-600 dark:text-teal-400 font-medium hover:underline"
                        >
                            {isLogin ? "Sign up" : "Sign in"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
