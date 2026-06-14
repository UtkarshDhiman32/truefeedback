// import OpenAI from 'openai';
// import { OpenAIStream, StreamingTextResponse } from 'ai';
// import { NextResponse } from 'next/server';

// const openai = new OpenAI({
//     apiKey: process.env.OPENAI_API_KEY,
// });

// export const runtime = 'edge';

// export async function POST(req: Request) {
//     try {
//         const prompt =
//             "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What’s a hobby you’ve recently started?||If you could have dinner with any historical figure, who would it be?||What’s a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.";

//         const response = await openai.completions.create({
//             model: 'gpt-3.5-turbo-instruct',
//             max_tokens: 400,
//             stream: true,
//             prompt,
//         });

//         const stream = OpenAIStream(response);


//         return new StreamingTextResponse(stream);
//     } catch (error) {
//         if (error instanceof OpenAI.APIError) {
//             // OpenAI API error handling
//             const { name, status, headers, message } = error;
//             return NextResponse.json({ name, status, headers, message }, { status });
//         } else {
//             // General error handling
//             console.error('An unexpected error occurred:', error);
//             throw error;
//         }
//     }
// }   

// "openai": "^6.42.0",

import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ success: false, message: "API Key missing in .env" }, { status: 500 });
        }

        const prompt =
            "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What’s a hobby you’ve recently started?||If you could have dinner with any historical figure, who would it be?||What’s a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment. Do not include any intro, outro, numbers, or markdown—just the raw string with '||' symbols.";

        // Direct HTTP Post Request to Gemini API API Endpoint
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                }),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("Gemini Endpoint Raw Error:", data);
            return NextResponse.json({ success: false, message: data.error?.message || "Gemini Error" }, { status: response.status });
        }

        // Gemini se text nikalna
        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        // Clean Response for the Frontend
        return new Response(textResponse.trim(), { status: 200 });

    } catch (error: any) {
        console.error('Fatal Integration Error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to connect to AI engine' },
            { status: 500 }
        );
    }
}