import { NextRequest, NextResponse } from 'next/server';
import { retrieveConstitutionalContext } from '@/lib/rag';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages = [], language = 'English' } = body;

    if (!messages.length) {
      return NextResponse.json({ error: 'Conversation history is empty' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured in environment variables.' },
        { status: 500 }
      );
    }

    const userQuery = messages[messages.length - 1].content;
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

    // 1. Context-Aware Retrieval
    let searchQuery = userQuery;
    if (userQuery.split(/\s+/).length < 5 && messages.length >= 3) {
      searchQuery = `${messages[messages.length - 3].content} ${userQuery}`;
    }

    const context = retrieveConstitutionalContext(searchQuery, 7);

    // 2. Prepare System Instructions
    let systemInstruction =
      "You are the Kenyan Civic Educator, a highly knowledgeable and professional expert " +
      "on the Constitution of Kenya. Empower citizens with accurate advice. " +
      "Ensure that your explanations are well thought out, clear, and easy to understand " +
      "for a layperson, while preserving exact legal meanings. " +
      "Ground your answer in the provided legal context without mentioning the context itself. " +
      "Maintain continuity in dialogue.\n\n" +
      `RELEVANT CONSTITUTIONAL SECTIONS:\n${context}`;

    if (language !== 'English') {
      systemInstruction +=
        `\n\nCRITICAL: The citizen is asking in ${language}. You MUST translate your response ` +
        `and answer them entirely in fluent ${language}. ` +
        `Ensure your translation is semantically and grammatically correct in ${language}, ` +
        `avoiding literal translations of English idioms. Use standard spelling, natural phrasing, ` +
        `and culturally appropriate legal equivalents in ${language}. ` +
        `If they code-switch or use Sheng/mixed language, you may respond in a friendly and accessible ` +
        `manner in the requested language while maintaining strict grammatical consistency and professional legal accuracy.`;
    }

    // Format message history for Gemini API
    const formattedContents = messages.slice(-10).map((msg: { role: string; content: string }) => ({
      role: msg.role === 'bot' || msg.role === 'assistant' || msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // 3. Call Gemini REST API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemInstruction }]
          },
          contents: formattedContents
        })
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API Error:', errText);
      return NextResponse.json(
        { content: 'Our legal intelligence system is momentarily unavailable. Please try again shortly.' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const replyText =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No matching constitutional provisions were found for this query.";

    return NextResponse.json({ content: replyText });
  } catch (error) {
    console.error('Chat endpoint error:', error);
    return NextResponse.json(
      { content: 'Our legal intelligence system is momentarily unavailable. Please try again shortly.' },
      { status: 500 }
    );
  }
}
