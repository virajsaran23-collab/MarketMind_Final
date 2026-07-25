import { NextResponse } from 'next/server'
import { execSync } from 'child_process'

export async function GET() {
  try {
    const output = execSync(
      `python3 /Users/virajsaran/Desktop/MarketMind\\ Project/MarketMind_Final/copy_opec_image.py`,
      { encoding: 'utf-8' }
    )
    return NextResponse.json({ success: true, output })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message, stderr: err.stderr?.toString() })
  }
}
