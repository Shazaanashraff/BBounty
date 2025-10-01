import { NextResponse } from 'next/server'
import dbManager from '../../../../../lib/database.js'
import authManager from '../../../../../lib/auth.js'
import { CHALLENGE_CONFIG } from '../../../../../lib/config.js'
import crypto from 'crypto'

// VULNERABLE: Cryptographic Failures challenge for educational purposes
export async function GET(request) {
  try {
    await dbManager.connect()
    
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const token = searchParams.get('token')

    // Log the attempt
    await dbManager.createLog({
      type: 'crypto_challenge_attempt',
      action,
      hasToken: !!token,
      timestamp: new Date()
    })

    let response = {
      success: false,
      message: 'Unknown action'
    }

    const flags = []

    switch (action) {
      case 'get-secrets':
        // VULNERABLE: Secrets stored in plaintext
        const secrets = {
          apiKeys: {
            production: 'sk-prod-1234567890abcdef',
            development: 'sk-dev-0987654321fedcba'
          },
          passwords: {
            // VULNERABLE: Weak hashing visible
            admin: {
              hash: 'YWRtaW4xMjNzYWx0MTIz', // Base64 encoded 'admin123salt123'
              method: 'base64',
              salt: 'salt123'
            },
            user: {
              hash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', // SHA-256 of 'password'
              method: 'sha256',
              salt: 'none'
            }
          },
          tokens: {
            resetToken: generateWeakToken('password-reset'),
            sessionToken: generateWeakToken('session-' + Date.now())
          }
        }

        response.success = true
        response.message = 'Secrets retrieved from insecure storage'
        response.secrets = secrets

        flags.push({
          challengeId: 'cryptographic-failures',
          subtaskId: 'crypto-storage',
          flag: CHALLENGE_CONFIG['cryptographic-failures'].flags['crypto-storage'],
          description: 'Insecure storage discovered'
        })
        break

      case 'crack-hash':
        const hash = searchParams.get('hash')
        if (hash) {
          const crackedPassword = crackWeakHash(hash)
          if (crackedPassword) {
            response.success = true
            response.message = 'Hash cracked successfully'
            response.originalPassword = crackedPassword
            response.method = 'Dictionary/Rainbow table attack'

            flags.push({
              challengeId: 'cryptographic-failures',
              subtaskId: 'crypto-weak',
              flag: CHALLENGE_CONFIG['cryptographic-failures'].flags['crypto-weak'],
              description: 'Weak hash cracked'
            })
          } else {
            response.message = 'Hash not crackable with current methods'
          }
        } else {
          response.message = 'Hash parameter required'
        }
        break

      case 'validate-token':
        if (token) {
          const validation = validateWeakToken(token)
          response.success = true
          response.message = 'Token analysis completed'
          response.validation = validation

          if (validation.predictable || validation.manipulated) {
            flags.push({
              challengeId: 'cryptographic-failures',
              subtaskId: 'crypto-token',
              flag: CHALLENGE_CONFIG['cryptographic-failures'].flags['crypto-token'],
              description: 'Token manipulation successful'
            })
          }
        } else {
          response.message = 'Token parameter required'
        }
        break

      case 'generate-token':
        const userId = searchParams.get('userId') || 'user123'
        const weakToken = generateWeakToken(userId)
        
        response.success = true
        response.message = 'Weak token generated'
        response.token = weakToken
        response.hint = 'This token uses predictable generation. Can you forge one?'
        break

      default:
        response.availableActions = [
          'get-secrets - Retrieve stored secrets',
          'crack-hash - Attempt to crack a hash',
          'validate-token - Analyze token security', 
          'generate-token - Generate a weak token'
        ]
        break
    }

    if (flags.length > 0) {
      response.flags = flags
      
      await dbManager.createLog({
        type: 'flag_captured',
        challengeId: 'cryptographic-failures',
        flags: flags.map(f => f.subtaskId),
        action,
        timestamp: new Date()
      })
    }

    return NextResponse.json(response)
    
  } catch (error) {
    console.error('Cryptographic failures challenge error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// VULNERABLE: Weak token generation
function generateWeakToken(data) {
  // VULNERABLE: Predictable token generation
  const timestamp = Date.now()
  const predictableData = `${data}-${timestamp}-secret123`
  return Buffer.from(predictableData).toString('base64')
}

// Hash cracking simulation
function crackWeakHash(hash) {
  const commonPasswords = {
    'YWRtaW4xMjNzYWx0MTIz': 'admin123', // base64 of 'admin123salt123' 
    '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8': 'password', // SHA-256 of 'password'
    '5d41402abc4b2a76b9719d911017c592': 'hello', // MD5 of 'hello'
    'aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d': 'hello', // SHA-1 of 'hello'
  }

  return commonPasswords[hash] || null
}

// Token validation
function validateWeakToken(token) {
  try {
    const decoded = Buffer.from(token, 'base64').toString()
    const parts = decoded.split('-')
    
    return {
      decoded: decoded,
      predictable: parts.length >= 3 && parts[2] === 'secret123',
      manipulated: decoded !== token,
      structure: parts,
      valid: true
    }
  } catch (error) {
    return {
      valid: false,
      error: 'Invalid token format'
    }
  }
}