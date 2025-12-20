"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");

interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}

interface PlaceSuggestion {
    name: string;
    description: string;
    type: string;
    estimatedDuration?: string;
    estimatedCost?: string;
}

interface ChatResponse {
    message: string;
    suggestions?: PlaceSuggestion[];
    error?: string;
}

const SYSTEM_PROMPT = `You are a friendly and knowledgeable travel assistant helping users plan their trips. You provide helpful suggestions about:
- Popular tourist attractions and hidden gems
- Restaurants, cafes, and local food recommendations  
- Activities and experiences
- Practical travel tips

When suggesting places to visit, format your response in a helpful way with:
- Name of the place
- Brief description (1-2 sentences)
- Why it's worth visiting

Be enthusiastic but concise. Focus on quality recommendations over quantity (max 5-6 suggestions per response).

If the user asks about a specific destination, tailor your suggestions to that location.
If they mention their trip details, consider those when giving recommendations.

Always be helpful, friendly, and encouraging about their travel plans!`;

export async function chatWithAssistant(
    userMessage: string,
    tripContext?: {
        destination?: string;
        days?: number;
        currentDay?: number;
    },
    chatHistory: ChatMessage[] = []
): Promise<ChatResponse> {
    try {
        if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
            return {
                message: "AI assistant is not configured. Please add GOOGLE_GENERATIVE_AI_API_KEY to your environment.",
                error: "Missing API key"
            };
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
        });

        // Build context from trip
        let contextMessage = "";
        if (tripContext) {
            const parts = [];
            if (tripContext.destination) {
                parts.push(`The user is planning a trip to ${tripContext.destination}`);
            }
            if (tripContext.days) {
                parts.push(`The trip is ${tripContext.days} days long`);
            }
            if (tripContext.currentDay) {
                parts.push(`They are currently planning Day ${tripContext.currentDay}`);
            }
            if (parts.length > 0) {
                contextMessage = `\n\nContext: ${parts.join(". ")}.`;
            }
        }

        // Build conversation history
        const history = chatHistory.map((msg) => ({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.content }],
        }));

        // Start chat with history
        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: `System instructions: ${SYSTEM_PROMPT}${contextMessage}\n\nPlease acknowledge you understand and are ready to help.` }],
                },
                {
                    role: "model",
                    parts: [{ text: "I understand! I'm your friendly travel assistant, ready to help you plan an amazing trip. What would you like to know? 🌍" }],
                },
                ...history,
            ],
        });

        // Send the user's message
        const result = await chat.sendMessage(userMessage);
        const response = result.response;
        const text = response.text();

        return {
            message: text,
        };
    } catch (error) {
        console.error("Error in AI chat:", error);
        return {
            message: "Sorry, I encountered an error. Please try again.",
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}
