import { NextResponse } from 'next/server'
import dbManager from '../../../../../lib/database.js'
import authManager from '../../../../../lib/auth.js'
import { CHALLENGE_CONFIG } from '../../../../../lib/config.js'

// VULNERABLE: SQL Injection endpoint for educational purposes
export async function POST(request) {
  try {
    await dbManager.connect()
    
    const { username, password } = await request.json()
    
    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Log the attempt
    await dbManager.createLog({
      type: 'sql_injection_attempt',
      username,
      password: '***', // Don't log actual passwords
      timestamp: new Date(),
      ip: request.ip || 'unknown'
    })

    // VULNERABLE: Direct string concatenation simulating SQL injection
    const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`
    
    // Execute the vulnerable query
    const queryResult = dbManager.vulnerableQuery(query)
    
    let response = {
      success: false,
      message: 'Invalid credentials',
      query: queryResult.query, // Show the query for educational purposes
      vulnerable: queryResult.isVulnerable
    }

    // Check for SQL injection patterns and award flags
    if (queryResult.isVulnerable) {
      // Simulate successful SQL injection
      response.success = true
      response.message = 'SQL Injection successful! Authentication bypassed.'
      response.user = {
        id: 'sqli-user',
        username: 'admin',
        role: 'admin',
        injected: true
      }

      // Award flags based on the type of injection
      const flags = []
      
      // Basic bypass flag
      if (username.includes("'") || password.includes("'")) {
        flags.push({
          challengeId: 'sql-injection',
          subtaskId: 'sqli-basic',
          flag: CHALLENGE_CONFIG['sql-injection'].flags['sqli-basic'],
          description: 'Basic SQL injection bypass'
        })
      }

      // Data extraction flag
      if (query.toLowerCase().includes('union') || query.toLowerCase().includes('select')) {
        flags.push({
          challengeId: 'sql-injection',
          subtaskId: 'sqli-extract',
          flag: CHALLENGE_CONFIG['sql-injection'].flags['sqli-extract'],
          description: 'Data extraction via UNION'
        })
      }

      // Admin access flag  
      if (username.toLowerCase().includes('admin') || query.toLowerCase().includes('admin')) {
        flags.push({
          challengeId: 'sql-injection',
          subtaskId: 'sqli-admin',
          flag: CHALLENGE_CONFIG['sql-injection'].flags['sqli-admin'],
          description: 'Administrative access achieved'
        })
      }

      response.flags = flags

      // Log successful exploitation
      await dbManager.createLog({
        type: 'flag_captured',
        challengeId: 'sql-injection',
        flags: flags.map(f => f.subtaskId),
        query: queryResult.query,
        timestamp: new Date()
      })
    }

    return NextResponse.json(response)
    
  } catch (error) {
    console.error('SQL Injection challenge error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get challenge information
export async function GET(request) {
  try {
    const challenge = CHALLENGE_CONFIG['sql-injection']
    
    return NextResponse.json({
      success: true,
      challenge: {
        id: challenge.id,
        title: challenge.title,
        difficulty: challenge.difficulty,
        description: challenge.description,
        hint: challenge.hint,
        subtasks: challenge.subtasks
      },
      hints: [
        "Try different combinations of quotes and SQL keywords",
        "Look for ways to bypass the password check entirely", 
        "Consider using SQL comments to ignore part of the query"
      ]
    })
    
  } catch (error) {
    console.error('SQL Injection info error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to get challenge info' },
      { status: 500 }
    )
  }
}