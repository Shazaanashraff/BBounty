import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { APP_CONFIG } from './config.js'
import dbManager from './database.js'

// WARNING: Intentionally insecure implementations for educational purposes
export class AuthManager {
  constructor() {
    this.jwtSecret = APP_CONFIG.JWT_SECRET
  }

  // Secure method for comparison
  async hashPassword(password) {
    const saltRounds = 12
    return await bcrypt.hash(password, saltRounds)
  }

  // Secure method for comparison  
  async verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash)
  }

  // Generate JWT token
  generateToken(payload, expiresIn = '1h') {
    return jwt.sign(payload, this.jwtSecret, { expiresIn })
  }

  // Verify JWT token
  verifyToken(token) {
    try {
      return jwt.verify(token, this.jwtSecret)
    } catch (error) {
      return null
    }
  }

  // VULNERABLE: Weak password hashing for crypto failures challenge
  weakHashPassword(password) {
    // Using MD5-like weak hashing (simulated with base64)
    return Buffer.from(password + 'salt123').toString('base64')
  }

  // VULNERABLE: Insecure token generation for crypto failures challenge  
  generateWeakToken(userId) {
    // Predictable token generation
    const timestamp = Date.now()
    const predictableData = `${userId}-${timestamp}-secret123`
    return Buffer.from(predictableData).toString('base64')
  }

  // VULNERABLE: Client-side role validation for broken access control
  generateTokenWithClientRole(userId, role) {
    // Including role in JWT payload that can be manipulated client-side
    return this.generateToken({ 
      userId, 
      role,
      // Vulnerable: Including sensitive data in JWT
      isAdmin: role === 'admin',
      permissions: role === 'admin' ? ['read', 'write', 'delete'] : ['read']
    })
  }

  // User registration with intentional vulnerabilities
  async registerUser(email, password, role = 'user') {
    try {
      // Check if user already exists
      const existingUser = await dbManager.findUser({ email })
      if (existingUser) {
        return { success: false, message: 'User already exists' }
      }

      // Create user with both secure and insecure password hashes
      const secureHash = await this.hashPassword(password)
      const weakHash = this.weakHashPassword(password) // For crypto challenge
      
      const userData = {
        email,
        passwordHash: secureHash,
        // VULNERABLE: Store weak hash for crypto failures challenge
        weakPasswordHash: weakHash,
        role,
        createdAt: new Date(),
        loginAttempts: 0,
        isLocked: false
      }

      const user = await dbManager.createUser(userData)
      
      // Log the registration
      await dbManager.createLog({
        type: 'user_registration',
        userId: user.id,
        email,
        details: { role }
      })

      return { 
        success: true, 
        user: { 
          id: user.id, 
          email: user.email, 
          role: user.role 
        } 
      }
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, message: 'Registration failed' }
    }
  }

  // VULNERABLE: Login method with SQL injection vulnerability
  async vulnerableLogin(email, password) {
    try {
      await dbManager.connect()
      
      // VULNERABLE: Direct string interpolation simulating SQL injection
      const query = `SELECT * FROM users WHERE email = '${email}' AND password = '${password}'`
      
      // Simulate vulnerable query execution
      const queryResult = dbManager.vulnerableQuery(query)
      
      // Log the attempt
      await dbManager.createLog({
        type: 'login_attempt',
        email,
        query: queryResult.query,
        isVulnerable: queryResult.isVulnerable,
        timestamp: new Date()
      })

      // Check for SQL injection patterns
      if (queryResult.isVulnerable) {
        // Simulate successful injection
        const adminUser = {
          id: 'admin-001',
          email: 'admin@ctf.local',
          role: 'admin',
          injected: true
        }
        
        // Award flag for successful SQL injection
        await dbManager.captureFlag(
          'anonymous', 
          'sql-injection', 
          'sqli-basic',
          'CTF{sql_1nj3ct10n_b4s1c_byp455}'
        )

        return {
          success: true,
          user: adminUser,
          token: this.generateToken(adminUser),
          injected: true
        }
      }

      // Normal login flow
      const user = await dbManager.findUser({ email })
      if (!user) {
        return { success: false, message: 'Invalid credentials' }
      }

      // Check if account is locked
      if (user.isLocked) {
        return { success: false, message: 'Account is locked due to too many failed attempts' }
      }

      // Verify password
      const isValidPassword = await this.verifyPassword(password, user.passwordHash)
      
      if (!isValidPassword) {
        // Increment failed attempts
        await dbManager.updateUser(
          { id: user.id },
          { 
            loginAttempts: (user.loginAttempts || 0) + 1,
            isLocked: (user.loginAttempts || 0) + 1 >= APP_CONFIG.MAX_LOGIN_ATTEMPTS
          }
        )
        return { success: false, message: 'Invalid credentials' }
      }

      // Reset login attempts on successful login
      await dbManager.updateUser(
        { id: user.id },
        { loginAttempts: 0, isLocked: false, lastLogin: new Date() }
      )

      // Create session
      const sessionData = {
        userId: user.id,
        email: user.email,
        role: user.role
      }
      
      const session = await dbManager.createSession(sessionData)
      const token = this.generateToken(sessionData)

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        },
        token,
        sessionId: session.id
      }
      
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, message: 'Login failed' }
    }
  }

  // VULNERABLE: Authorization check that can be bypassed
  async checkAuthorization(token, requiredRole = null) {
    try {
      const decoded = this.verifyToken(token)
      if (!decoded) {
        return { authorized: false, message: 'Invalid token' }
      }

      // VULNERABLE: Client-side role checking
      if (requiredRole && decoded.role !== requiredRole) {
        // But still return user data that can be manipulated
        return { 
          authorized: false, 
          message: 'Insufficient permissions',
          // VULNERABLE: Leaking user data even when unauthorized
          user: decoded,
          hint: 'Check if role verification is done client-side'
        }
      }

      return { 
        authorized: true, 
        user: decoded 
      }
    } catch (error) {
      return { authorized: false, message: 'Authorization failed' }
    }
  }

  // VULNERABLE: Admin check with flawed logic
  isAdmin(token) {
    const decoded = this.verifyToken(token)
    
    // VULNERABLE: Multiple ways to bypass this check
    if (!decoded) return false
    
    // Method 1: Direct role check (can be manipulated in JWT)
    if (decoded.role === 'admin') return true
    
    // Method 2: Check isAdmin flag (can be manipulated)
    if (decoded.isAdmin === true) return true
    
    // Method 3: Check permissions array (can be manipulated)
    if (decoded.permissions && decoded.permissions.includes('delete')) return true
    
    // VULNERABLE: Weak fallback check
    if (decoded.email && decoded.email.includes('admin')) return true
    
    return false
  }

  // Method to generate admin session for broken access control challenge
  async createAdminSession() {
    const adminData = {
      id: 'admin-backdoor',
      email: 'admin@ctf.local',
      role: 'admin',
      isAdmin: true,
      permissions: ['read', 'write', 'delete', 'admin']
    }
    
    return {
      token: this.generateToken(adminData),
      user: adminData
    }
  }
}

// Export singleton instance
const authManager = new AuthManager()
export default authManager