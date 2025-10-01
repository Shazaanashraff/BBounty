import { NextResponse } from 'next/server'
import authManager from '../../../../lib/auth.js'
import dbManager from '../../../../lib/database.js'

export async function POST(request) {
  try {
    await dbManager.connect()
    
    const { email, password, confirmPassword } = await request.json()
    
    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      )
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'Passwords do not match' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Register user
    const result = await authManager.registerUser(email, password, 'user')
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Registration successful',
        user: result.user
      })
    } else {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}