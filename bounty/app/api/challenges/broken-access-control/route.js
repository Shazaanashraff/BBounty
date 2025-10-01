import { NextResponse } from 'next/server'
import dbManager from '../../../../../lib/database.js'
import authManager from '../../../../../lib/auth.js'
import { CHALLENGE_CONFIG } from '../../../../../lib/config.js'

// VULNERABLE: Broken access control for educational purposes
export async function GET(request) {
  try {
    await dbManager.connect()
    
    const { searchParams } = new URL(request.url)
    const endpoint = searchParams.get('endpoint')
    const token = request.cookies.get('ctf-session')?.value

    // Log the attempt
    await dbManager.createLog({
      type: 'access_control_attempt',
      endpoint,
      hasToken: !!token,
      timestamp: new Date()
    })

    let response = {
      success: false,
      message: 'Access denied',
      endpoint: endpoint
    }

    const flags = []

    // VULNERABLE: Check different endpoints with flawed access control
    switch (endpoint) {
      case 'admin-panel':
        // VULNERABLE: Client-side role check only
        if (!token) {
          response.message = 'Authentication required'
          // But still leak that this endpoint exists
          response.hint = 'This endpoint requires admin privileges'
          break
        }

        const authResult = await authManager.checkAuthorization(token, 'admin')
        
        // VULNERABLE: Even if unauthorized, we provide useful information
        if (!authResult.authorized) {
          response.message = authResult.message
          response.userRole = authResult.user?.role || 'none'
          response.hint = 'Try manipulating your JWT token or finding another way to get admin access'
          
          // Award flag for discovering the endpoint
          flags.push({
            challengeId: 'broken-access-control',
            subtaskId: 'bac-enum',
            flag: CHALLENGE_CONFIG['broken-access-control'].flags['bac-enum'],
            description: 'Hidden admin endpoint discovered'
          })
        } else {
          response.success = true
          response.message = 'Welcome to the admin panel!'
          response.adminData = {
            users: ['admin', 'user1', 'user2'],
            logs: ['login_attempt', 'challenge_attempt'],
            settings: { debug: true, maintenance: false }
          }
          
          flags.push({
            challengeId: 'broken-access-control',
            subtaskId: 'bac-escalate',
            flag: CHALLENGE_CONFIG['broken-access-control'].flags['bac-escalate'],
            description: 'Administrative access achieved'
          })
        }
        break

      case 'user-profile':
        // VULNERABLE: No authentication required for "user" endpoints
        response.success = true
        response.message = 'User profile access granted'
        response.userData = {
          profiles: [
            { id: 1, name: 'John Doe', email: 'john@example.com' },
            { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
            { id: 3, name: 'Admin User', email: 'admin@ctf.local' }
          ]
        }
        
        flags.push({
          challengeId: 'broken-access-control',
          subtaskId: 'bac-bypass',
          flag: CHALLENGE_CONFIG['broken-access-control'].flags['bac-bypass'],
          description: 'Unauthorized access to user data'
        })
        break

      case 'debug-info':
        // VULNERABLE: Debug endpoint accessible to everyone
        response.success = true
        response.message = 'Debug information'
        response.debugInfo = {
          environment: 'production',
          version: '1.2.3',
          database: process.env.MONGODB_URI ? 'MongoDB' : 'In-Memory',
          secrets: {
            jwtSecret: 'exposed-jwt-secret-123',
            adminPassword: 'admin123',
            databaseUrl: 'mongodb://localhost:27017/ctf'
          }
        }
        
        flags.push({
          challengeId: 'broken-access-control', 
          subtaskId: 'bac-enum',
          flag: CHALLENGE_CONFIG['broken-access-control'].flags['bac-enum'],
          description: 'Debug endpoint discovered'
        })
        break

      default:
        response.message = 'Unknown endpoint'
        response.availableEndpoints = [
          'admin-panel - Admin access required',
          'user-profile - User access', 
          'debug-info - Debug information'
        ]
        break
    }

    if (flags.length > 0) {
      response.flags = flags
      
      // Log captured flags
      await dbManager.createLog({
        type: 'flag_captured',
        challengeId: 'broken-access-control',
        flags: flags.map(f => f.subtaskId),
        endpoint,
        timestamp: new Date()
      })
    }

    return NextResponse.json(response)
    
  } catch (error) {
    console.error('Broken access control challenge error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// VULNERABLE: Admin token generation endpoint
export async function POST(request) {
  try {
    const { action } = await request.json()
    
    if (action === 'generate-admin-token') {
      // VULNERABLE: Easily accessible admin token generation
      const adminSession = await authManager.createAdminSession()
      
      return NextResponse.json({
        success: true,
        message: 'Admin token generated',
        token: adminSession.token,
        hint: 'You can use this token to access admin endpoints'
      })
    }

    return NextResponse.json(
      { success: false, message: 'Unknown action' },
      { status: 400 }
    )
    
  } catch (error) {
    console.error('Admin token generation error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}