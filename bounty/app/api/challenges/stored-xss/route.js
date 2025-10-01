import { NextResponse } from 'next/server'
import dbManager from '../../../../../lib/database.js'
import { CHALLENGE_CONFIG } from '../../../../../lib/config.js'

// VULNERABLE: Stored XSS challenge for educational purposes
export async function POST(request) {
  try {
    await dbManager.connect()
    
    const { comment, author } = await request.json()
    
    if (!comment || !author) {
      return NextResponse.json(
        { success: false, message: 'Comment and author are required' },
        { status: 400 }
      )
    }

    // Log the attempt
    await dbManager.createLog({
      type: 'xss_attempt',
      author,
      commentLength: comment.length,
      containsScript: comment.toLowerCase().includes('<script>'),
      timestamp: new Date()
    })

    // VULNERABLE: Store comment without sanitization
    const commentData = {
      author,
      content: comment, // NO SANITIZATION - VULNERABLE!
      timestamp: new Date(),
      id: Math.random().toString(36).substr(2, 9)
    }
    
    const savedComment = await dbManager.createComment(commentData)
    
    // Check for XSS patterns and award flags
    const flags = []
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe/i,
      /<img[^>]*onerror/i
    ]

    const hasXSS = xssPatterns.some(pattern => pattern.test(comment))
    
    if (hasXSS) {
      // Basic XSS flag
      flags.push({
        challengeId: 'stored-xss',
        subtaskId: 'xss-basic',
        flag: CHALLENGE_CONFIG['stored-xss'].flags['xss-basic'],
        description: 'Basic XSS payload stored'
      })

      // Persistent storage flag
      flags.push({
        challengeId: 'stored-xss', 
        subtaskId: 'xss-persist',
        flag: CHALLENGE_CONFIG['stored-xss'].flags['xss-persist'],
        description: 'XSS payload persisted in storage'
      })

      // Check for admin session hijacking attempts
      if (comment.toLowerCase().includes('cookie') || 
          comment.toLowerCase().includes('document.cookie') ||
          comment.toLowerCase().includes('session')) {
        flags.push({
          challengeId: 'stored-xss',
          subtaskId: 'xss-admin',
          flag: CHALLENGE_CONFIG['stored-xss'].flags['xss-admin'],
          description: 'Session hijacking XSS detected'
        })
      }
    }

    let response = {
      success: true,
      message: 'Comment saved successfully',
      comment: savedComment,
      stored: true
    }

    if (flags.length > 0) {
      response.flags = flags
      response.xssDetected = true
      response.message = 'XSS payload stored successfully!'
      
      await dbManager.createLog({
        type: 'flag_captured',
        challengeId: 'stored-xss',
        flags: flags.map(f => f.subtaskId),
        payload: comment.substring(0, 100), // Log first 100 chars
        timestamp: new Date()
      })
    }

    return NextResponse.json(response)
    
  } catch (error) {
    console.error('Stored XSS challenge error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get comments (vulnerable display)
export async function GET(request) {
  try {
    await dbManager.connect()
    
    const comments = await dbManager.getComments({})
    
    return NextResponse.json({
      success: true,
      comments: comments.map(comment => ({
        id: comment.id,
        author: comment.author,
        // VULNERABLE: Return raw content without sanitization
        content: comment.content,
        timestamp: comment.timestamp || comment.createdAt
      })),
      warning: 'Comments are displayed without sanitization - XSS risk!'
    })
    
  } catch (error) {
    console.error('Get comments error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

// Delete comment endpoint (for admin cleanup)
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const commentId = searchParams.get('id')
    
    if (!commentId) {
      return NextResponse.json(
        { success: false, message: 'Comment ID required' },
        { status: 400 }
      )
    }

    // In a real app, this would delete from the database
    // For demo purposes, we'll just return success
    return NextResponse.json({
      success: true,
      message: 'Comment deleted (demo mode)'
    })
    
  } catch (error) {
    console.error('Delete comment error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}