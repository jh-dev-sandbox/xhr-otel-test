import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const traceparent = req.headers.get('traceparent');
  return NextResponse.json({
    traceparent,
    description: 'This is the value of the traceparent header received by the backend.'
  });
}

