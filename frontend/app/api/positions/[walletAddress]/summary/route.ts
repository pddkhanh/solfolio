import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function GET(
  request: Request,
  { params }: { params: { walletAddress: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const refresh = searchParams.get('refresh');
    const walletAddress = params.walletAddress;
    
    const url = `${BACKEND_URL}/positions/${walletAddress}/summary${refresh ? '?refresh=true' : ''}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      // Don't cache if refresh is requested
      next: refresh ? { revalidate: 0 } : { revalidate: 60 },
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { success: false, error: 'Failed to fetch positions' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying positions request:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}