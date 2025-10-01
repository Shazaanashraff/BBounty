import { NextResponse } from 'next/server'
import dbManager from '../../../../../lib/database.js'
import authManager from '../../../../../lib/auth.js'
import { CHALLENGE_CONFIG } from '../../../../../lib/config.js'

// VULNERABLE: IDOR (Insecure Direct Object Reference) for educational purposes
export async function GET(request) {
  try {
    await dbManager.connect()
    
    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('fileId')
    const userId = searchParams.get('userId')

    // Log the attempt
    await dbManager.createLog({
      type: 'idor_attempt',
      fileId,
      userId,
      timestamp: new Date()
    })

    let response = {
      success: false,
      message: 'File not found'
    }

    const flags = []

    if (fileId) {
      // VULNERABLE: No ownership validation - direct object access
      const fileData = await getFileById(fileId)
      
      if (fileData) {
        response.success = true
        response.message = 'File accessed successfully'
        response.file = fileData
        
        // Award flag for accessing file
        flags.push({
          challengeId: 'idor',
          subtaskId: 'idor-access',
          flag: CHALLENGE_CONFIG['idor'].flags['idor-access'],
          description: 'Unauthorized file access via IDOR'
        })

        // Check if accessing another user's file
        if (fileData.isPrivate && fileData.owner !== 'current-user') {
          flags.push({
            challengeId: 'idor',
            subtaskId: 'idor-enum',
            flag: CHALLENGE_CONFIG['idor'].flags['idor-enum'],
            description: 'Private file enumeration successful'
          })
        }
      }
    }

    if (userId) {
      // VULNERABLE: User profile access without authorization
      const userProfile = await getUserProfile(userId)
      
      if (userProfile) {
        response.success = true
        response.message = 'User profile accessed'
        response.profile = userProfile
        
        flags.push({
          challengeId: 'idor',
          subtaskId: 'idor-access',
          flag: CHALLENGE_CONFIG['idor'].flags['idor-access'],
          description: 'Unauthorized user profile access'
        })
      }
    }

    if (!fileId && !userId) {
      // Return list of available objects for enumeration
      response.message = 'Specify fileId or userId parameter'
      response.examples = {
        files: ['1', '2', '3', '4', '5'],
        users: ['100', '101', '102', '103', '104']
      }
      response.hint = 'Try different IDs to see what you can access'
    }

    if (flags.length > 0) {
      response.flags = flags
      
      await dbManager.createLog({
        type: 'flag_captured',
        challengeId: 'idor',
        flags: flags.map(f => f.subtaskId),
        fileId,
        userId,
        timestamp: new Date()
      })
    }

    return NextResponse.json(response)
    
  } catch (error) {
    console.error('IDOR challenge error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// VULNERABLE: File modification endpoint
export async function POST(request) {
  try {
    const { fileId, newContent } = await request.json()
    
    if (!fileId) {
      return NextResponse.json(
        { success: false, message: 'File ID required' },
        { status: 400 }
      )
    }

    // VULNERABLE: No ownership check for file modification
    const result = await modifyFile(fileId, newContent)
    
    if (result.success) {
      const flags = [{
        challengeId: 'idor',
        subtaskId: 'idor-modify',
        flag: CHALLENGE_CONFIG['idor'].flags['idor-modify'],
        description: 'File modification via IDOR'
      }]

      await dbManager.createLog({
        type: 'flag_captured',
        challengeId: 'idor',
        flags: flags.map(f => f.subtaskId),
        fileId,
        action: 'modify',
        timestamp: new Date()
      })

      return NextResponse.json({
        success: true,
        message: 'File modified successfully',
        flags
      })
    }

    return NextResponse.json(
      { success: false, message: 'File modification failed' },
      { status: 404 }
    )
    
  } catch (error) {
    console.error('IDOR modification error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Mock data functions for demonstration
async function getFileById(fileId) {
  const files = {
    '1': {
      id: '1',
      name: 'public-document.txt',
      content: 'This is a public document.',
      owner: 'user1',
      isPrivate: false
    },
    '2': {
      id: '2', 
      name: 'private-notes.txt',
      content: 'These are my private notes with sensitive information.',
      owner: 'user2',
      isPrivate: true
    },
    '3': {
      id: '3',
      name: 'admin-config.txt',
      content: 'Admin configuration: password=admin123, debug=true',
      owner: 'admin',
      isPrivate: true
    },
    '4': {
      id: '4',
      name: 'user-secrets.txt', 
      content: 'Secret API key: sk-1234567890abcdef',
      owner: 'user3',
      isPrivate: true
    }
  }

  return files[fileId] || null
}

async function getUserProfile(userId) {
  const users = {
    '100': { id: '100', name: 'John Doe', email: 'john@example.com', role: 'user' },
    '101': { id: '101', name: 'Jane Smith', email: 'jane@example.com', role: 'user' },
    '102': { id: '102', name: 'Admin User', email: 'admin@ctf.local', role: 'admin' },
    '103': { id: '103', name: 'Test User', email: 'test@example.com', role: 'user' }
  }

  return users[userId] || null
}

async function modifyFile(fileId, newContent) {
  // Simulate file modification
  const file = await getFileById(fileId)
  if (file) {
    return { success: true, message: 'File modified' }
  }
  return { success: false, message: 'File not found' }
}