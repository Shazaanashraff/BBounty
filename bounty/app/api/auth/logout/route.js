import { NextResponse } from 'next/server'
import authManager from '../../../../lib/auth.js'
import dbManager from '../../../../lib/database.js'

export async function POST(request) {
  try {
    const token = request.cookies.get('ctf-session')?.value
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No session token' },
        { status: 401 }
      )
    }

    const decoded = authManager.verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      )
    }

    // Delete session from database if exists
    if (decoded.sessionId) {
      await dbManager.deleteSession({ id: decoded.sessionId })
    }

    // Clear the cookie
    const response = NextResponse.json({
      success: true,
      message: 'Logout successful'
    })
    
    response.cookies.set('ctf-session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0
    })
    
    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}