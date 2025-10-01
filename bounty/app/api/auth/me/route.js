import { NextResponse } from 'next/server'
import authManager from '../../../../lib/auth.js'

export async function GET(request) {
  try {
    const token = request.cookies.get('ctf-session')?.value
    
    if (!token) {
      return NextResponse.json(
        { authenticated: false, message: 'No session token' },
        { status: 401 }
      )
    }

    const decoded = authManager.verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { authenticated: false, message: 'Invalid token' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role
      }
    })
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json(
      { authenticated: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}