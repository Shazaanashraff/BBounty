/**
 * Tests for Authentication Manager
 * These tests validate both secure and vulnerable authentication methods
 */

import authManager from '../lib/auth.js'
import { CHALLENGE_CONFIG } from '../lib/config.js'

// Mock database manager
jest.mock('../lib/database.js', () => ({
  connect: jest.fn(),
  findUser: jest.fn(),
  createUser: jest.fn(),
  updateUser: jest.fn(),
  createLog: jest.fn(),
  captureFlag: jest.fn(),
}))

describe('AuthManager', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Password Hashing', () => {
    it('should hash passwords securely', async () => {
      const password = 'testPassword123'
      const hash = await authManager.hashPassword(password)
      
      expect(hash).toBeDefined()
      expect(hash).not.toBe(password)
      expect(hash.length).toBeGreaterThan(50) // bcrypt hashes are typically 60 chars
    })

    it('should verify passwords correctly', async () => {
      const password = 'testPassword123'
      const hash = await authManager.hashPassword(password)
      
      const isValid = await authManager.verifyPassword(password, hash)
      const isInvalid = await authManager.verifyPassword('wrongPassword', hash)
      
      expect(isValid).toBe(true)
      expect(isInvalid).toBe(false)
    })

    it('should generate weak hashes for crypto challenge', () => {
      const password = 'testPassword123'
      const weakHash = authManager.weakHashPassword(password)
      
      expect(weakHash).toBeDefined()
      expect(weakHash).toBe(Buffer.from(password + 'salt123').toString('base64'))
    })
  })

  describe('JWT Token Management', () => {
    it('should generate valid JWT tokens', () => {
      const payload = { userId: '123', email: 'test@example.com' }
      const token = authManager.generateToken(payload)
      
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.split('.')).toHaveLength(3) // JWT has 3 parts
    })

    it('should verify valid tokens', () => {
      const payload = { userId: '123', email: 'test@example.com' }
      const token = authManager.generateToken(payload)
      const decoded = authManager.verifyToken(token)
      
      expect(decoded).toBeDefined()
      expect(decoded.userId).toBe(payload.userId)
      expect(decoded.email).toBe(payload.email)
    })

    it('should reject invalid tokens', () => {
      const invalidToken = 'invalid.token.here'
      const decoded = authManager.verifyToken(invalidToken)
      
      expect(decoded).toBeNull()
    })
  })

  describe('Vulnerable Login (SQL Injection Challenge)', () => {
    beforeEach(() => {
      const mockDbManager = require('../lib/database.js')
      mockDbManager.connect.mockResolvedValue()
      mockDbManager.createLog.mockResolvedValue()
      mockDbManager.captureFlag.mockResolvedValue()
    })

    it('should detect SQL injection patterns', async () => {
      // Test various SQL injection payloads
      const injectionPayloads = [
        "admin' OR '1'='1",
        "admin'; DROP TABLE users; --",
        "admin' UNION SELECT * FROM users --"
      ]

      for (const payload of injectionPayloads) {
        const result = await authManager.vulnerableLogin(payload, 'password')
        
        expect(result.success).toBe(true)
        expect(result.injected).toBe(true)
        expect(result.user.role).toBe('admin')
      }
    })

    it('should perform normal login for non-injection attempts', async () => {
      const mockDbManager = require('../lib/database.js')
      mockDbManager.findUser.mockResolvedValue({
        id: '123',
        email: 'test@example.com',
        passwordHash: await authManager.hashPassword('password123'),
        role: 'user',
        loginAttempts: 0,
        isLocked: false
      })
      mockDbManager.updateUser.mockResolvedValue()
      mockDbManager.createSession.mockResolvedValue({ id: 'session123' })

      const result = await authManager.vulnerableLogin('test@example.com', 'password123')
      
      expect(mockDbManager.findUser).toHaveBeenCalledWith({ email: 'test@example.com' })
      expect(result.injected).toBeUndefined()
    })
  })

  describe('Authorization Checks', () => {
    it('should authorize valid admin tokens', async () => {
      const adminPayload = { userId: '123', role: 'admin', email: 'admin@test.com' }
      const token = authManager.generateToken(adminPayload)
      
      const result = await authManager.checkAuthorization(token, 'admin')
      
      expect(result.authorized).toBe(true)
      expect(result.user.role).toBe('admin')
    })

    it('should reject insufficient permissions', async () => {
      const userPayload = { userId: '123', role: 'user', email: 'user@test.com' }
      const token = authManager.generateToken(userPayload)
      
      const result = await authManager.checkAuthorization(token, 'admin')
      
      expect(result.authorized).toBe(false)
      expect(result.message).toBe('Insufficient permissions')
      // VULNERABLE: Still returns user data for broken access control challenge
      expect(result.user).toBeDefined()
    })

    it('should have multiple vulnerable admin check methods', () => {
      // Test various admin bypass methods for broken access control challenge
      const adminByRole = authManager.generateToken({ role: 'admin' })
      const adminByFlag = authManager.generateToken({ isAdmin: true })
      const adminByPermissions = authManager.generateToken({ permissions: ['delete'] })
      const adminByEmail = authManager.generateToken({ email: 'admin@example.com' })
      
      expect(authManager.isAdmin(adminByRole)).toBe(true)
      expect(authManager.isAdmin(adminByFlag)).toBe(true) 
      expect(authManager.isAdmin(adminByPermissions)).toBe(true)
      expect(authManager.isAdmin(adminByEmail)).toBe(true)
    })
  })

  describe('Vulnerable Token Generation', () => {
    it('should generate predictable weak tokens', () => {
      const userId = 'test123'
      const token1 = authManager.generateWeakToken(userId)
      const token2 = authManager.generateWeakToken(userId)
      
      expect(token1).toBeDefined()
      expect(token2).toBeDefined()
      // Tokens should be different due to timestamp but follow predictable pattern
      expect(token1).not.toBe(token2)
      
      // Decode and verify structure
      const decoded1 = Buffer.from(token1, 'base64').toString()
      expect(decoded1).toContain(userId)
      expect(decoded1).toContain('secret123')
    })

    it('should generate tokens with client-side role manipulation', () => {
      const token = authManager.generateTokenWithClientRole('user123', 'admin')
      const decoded = authManager.verifyToken(token)
      
      expect(decoded.role).toBe('admin')
      expect(decoded.isAdmin).toBe(true)
      expect(decoded.permissions).toContain('delete')
    })
  })
})

describe('Challenge Flag Integration', () => {
  it('should award SQL injection flags correctly', async () => {
    const mockDbManager = require('../lib/database.js')
    mockDbManager.connect.mockResolvedValue()
    mockDbManager.createLog.mockResolvedValue()
    mockDbManager.captureFlag.mockResolvedValue()

    await authManager.vulnerableLogin("admin' OR '1'='1", 'password')
    
    expect(mockDbManager.captureFlag).toHaveBeenCalledWith(
      'anonymous',
      'sql-injection', 
      'sqli-basic',
      CHALLENGE_CONFIG['sql-injection'].flags['sqli-basic']
    )
  })
})