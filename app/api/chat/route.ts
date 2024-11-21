import { NextResponse } from 'next/server'

interface ChatRequest {
  message: string
  useVoice: boolean
  character: string
  roomId: string
  userId: string
}

interface ChatResponse {
  content: string
  audioUrl: string | null
}

export async function POST(request: Request) {
  try {
    const body: ChatRequest = await request.json()
    
    if (!body.message) {
      return NextResponse.json(
        { error: 'Message text is required' },
        { status: 400 }
      )
    }

    const response = await fetch(`http://20.220.22.154:3000/${body.character}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        roomId: '',
        userId: '',
        userName: 'User',
        name: 'User',
        text: body.message,
        audio: body.useVoice || false
      })
    });

    const data = await response.json();
    
    // Map the response fields
    const mappedResponse: ChatResponse = {
      content: data[0].text,
      audioUrl: 'data:audio/mp3;base64,' + data[0].audioUrl
    };
    return NextResponse.json(mappedResponse);
  } catch (error) {
    console.error('Chat API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 