import { NextResponse } from 'next/server'
import { CHALLENGE_CONFIG } from '../../../lib/config.js'
import dbManager from '../../../lib/database.js'

export async function GET(request) {
  try {
    await dbManager.connect()
    
    // Get user flags from token or session
    const token = request.cookies.get('ctf-session')?.value
    let userFlags = []
    
    if (token) {
      // You could verify token and get user-specific flags here
      // For now, we'll use a simple approach
    }

    // Return challenge configuration without flags
    const challenges = Object.values(CHALLENGE_CONFIG).map(challenge => ({
      id: challenge.id,
      title: challenge.title,
      difficulty: challenge.difficulty,
      description: challenge.description,
      hint: challenge.hint,
      subtasks: challenge.subtasks.map(subtask => ({
        id: subtask.id,
        title: subtask.title,
        description: subtask.description
      }))
    }))

    return NextResponse.json({
      success: true,
      challenges,
      userFlags
    })
  } catch (error) {
    console.error('Challenges fetch error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch challenges' },
      { status: 500 }
    )
  }
}