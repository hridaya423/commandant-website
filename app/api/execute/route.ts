import { NextRequest, NextResponse } from 'next/server';

const { run } = require('../../../index.js');

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();
    
    if (!code || typeof code !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'No code provided'
      }, { status: 400 });
    }

    const result = run(code);
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Execution error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      output: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`
    }, { status: 500 });
  }
}