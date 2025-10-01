import { NextResponse } from 'next/server'
import authManager from '../../../../lib/auth.js'
import dbManager from '../../../../lib/database.js'

export async function POST(request) {
  try {
    await dbManager.connect()
    
    const { email, password } = await request.json()
    
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Use vulnerable login method for SQL injection challenge
    const result = await authManager.vulnerableLogin(email, password)
    
    if (result.success) {
      // Create HTTP-only cookie for the token
      const response = NextResponse.json({
        success: true,
        user: result.user,
        message: result.injected ? 'SQL injection detected!' : 'Login successful'
      })
      
      response.cookies.set('ctf-session', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3600 // 1 hour
      })
      
      return response
    } else {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}