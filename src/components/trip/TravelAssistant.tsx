"use client";

import { useState, useRef, useEffect } from "react";
import { chatWithAssistant } from "@/actions/ai";
import { MessageCircle, X, Send, Loader2, Sparkles, MapPin } from "lucide-react";
import { Trip } from "@prisma/client";
import { toast } from "sonner";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
}

interface TravelAssistantProps {
    trip: Trip;
    currentDay?: number;
    totalDays?: number;
}

export function TravelAssistant({ trip, currentDay, totalDays }: TravelAssistantProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome",
            role: "assistant",
            content: `Hi! 👋 I'm your travel assistant for your trip to **${trip.location || "your destination"}**! Ask me anything about places to visit, restaurants, activities, or travel tips.`,
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input.trim(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const chatHistory = messages
                .filter((m) => m.id !== "welcome")
                .map((m) => ({ role: m.role, content: m.content }));

            const response = await chatWithAssistant(
                userMessage.content,
                {
                    destination: trip.location || undefined,
                    days: totalDays,
                    currentDay,
                },
                chatHistory
            );

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: response.message,
            };

            setMessages((prev) => [...prev, assistantMessage]);

            if (response.error) {
                toast.error("AI response had an issue");
            }
        } catch (error) {
            console.error("Chat error:", error);
            toast.error("Failed to get AI response");
            setMessages((prev) => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: "Sorry, I had trouble responding. Please try again!",
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const quickPrompts = [
        `Best places to visit in ${trip.location || "this area"}?`,
        "Recommend local restaurants",
        "Hidden gems to explore",
        "What activities should I do?",
    ];

    // Floating button when closed
    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-full shadow-lg shadow-purple-200 dark:shadow-purple-900/30 flex items-center justify-center transition-all hover:scale-105 group"
            >
                <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            </button>
        );
    }

    // Chat panel when open
    return (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] h-[500px] max-h-[calc(100vh-6rem)] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    <span className="font-semibold">Travel Assistant</span>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`max-w-[85%] rounded-2xl px-4 py-2 ${message.role === "user"
                                ? "bg-violet-600 text-white rounded-br-md"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-md"
                                }`}
                        >
                            <div className="text-sm whitespace-pre-wrap leading-relaxed">
                                {message.content.split("**").map((part, i) =>
                                    i % 2 === 1 ? (
                                        <strong key={i}>{part}</strong>
                                    ) : (
                                        <span key={i}>{part}</span>
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-md px-4 py-3">
                            <div className="flex items-center gap-2 text-gray-500">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-sm">Thinking...</span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Quick prompts (only show if few messages) */}
            {messages.length <= 2 && !isLoading && (
                <div className="px-4 pb-2 flex flex-wrap gap-2">
                    {quickPrompts.map((prompt, i) => (
                        <button
                            key={i}
                            onClick={() => setInput(prompt)}
                            className="text-xs bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 px-3 py-1.5 rounded-full hover:bg-violet-100 dark:hover:bg-violet-900/50 transition-colors"
                        >
                            {prompt}
                        </button>
                    ))}
                </div>
            )}

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200 dark:border-gray-800">
                <div className="flex gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about places to visit..."
                        disabled={isLoading}
                        className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none text-gray-900 dark:text-white placeholder:text-gray-400 disabled:opacity-50"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="px-4 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </form>
        </div>
    );
}
