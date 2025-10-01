import { MongoClient } from 'mongodb'
import { APP_CONFIG } from './config.js'
import fs from 'fs'
import path from 'path'

class DatabaseManager {
  constructor() {
    this.client = null
    this.db = null
    this.useMongoDb = !!APP_CONFIG.MONGODB_URI
    this.inMemoryStore = {
      users: [],
      sessions: [],
      logs: [],
      flags: [],
      comments: [],
      files: []
    }
    this.dataFilePath = path.join(process.cwd(), 'data', 'ctf-data.json')
    
    if (!this.useMongoDb) {
      this.loadInMemoryData()
    }
  }

  async connect() {
    if (this.useMongoDb && !this.client) {
      try {
        this.client = new MongoClient(APP_CONFIG.MONGODB_URI)
        await this.client.connect()
        this.db = this.client.db('ctf-platform')
        console.log('Connected to MongoDB')
      } catch (error) {
        console.error('MongoDB connection failed, falling back to in-memory storage:', error)
        this.useMongoDb = false
        this.loadInMemoryData()
      }
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.close()
      this.client = null
      this.db = null
    }
  }

  loadInMemoryData() {
    try {
      if (fs.existsSync(this.dataFilePath)) {
        const data = fs.readFileSync(this.dataFilePath, 'utf8')
        this.inMemoryStore = { ...this.inMemoryStore, ...JSON.parse(data) }
      }
    } catch (error) {
      console.warn('Could not load data file, using empty in-memory store:', error)
    }
  }

  saveInMemoryData() {
    if (!this.useMongoDb) {
      try {
        const dataDir = path.dirname(this.dataFilePath)
        if (!fs.existsSync(dataDir)) {
          fs.mkdirSync(dataDir, { recursive: true })
        }
        fs.writeFileSync(this.dataFilePath, JSON.stringify(this.inMemoryStore, null, 2))
      } catch (error) {
        console.error('Failed to save data file:', error)
      }
    }
  }

  // Users collection methods
  async createUser(userData) {
    const user = {
      ...userData,
      id: this.generateId(),
      createdAt: new Date(),
      loginAttempts: 0,
      isLocked: false
    }

    if (this.useMongoDb) {
      const result = await this.db.collection('users').insertOne(user)
      return { ...user, _id: result.insertedId }
    } else {
      this.inMemoryStore.users.push(user)
      this.saveInMemoryData()
      return user
    }
  }

  async findUser(query) {
    if (this.useMongoDb) {
      return await this.db.collection('users').findOne(query)
    } else {
      return this.inMemoryStore.users.find(user => {
        return Object.keys(query).every(key => user[key] === query[key])
      })
    }
  }

  async updateUser(query, update) {
    if (this.useMongoDb) {
      return await this.db.collection('users').updateOne(query, { $set: update })
    } else {
      const userIndex = this.inMemoryStore.users.findIndex(user => {
        return Object.keys(query).every(key => user[key] === query[key])
      })
      if (userIndex !== -1) {
        this.inMemoryStore.users[userIndex] = { ...this.inMemoryStore.users[userIndex], ...update }
        this.saveInMemoryData()
        return { modifiedCount: 1 }
      }
      return { modifiedCount: 0 }
    }
  }

  async getAllUsers() {
    if (this.useMongoDb) {
      return await this.db.collection('users').find({}).toArray()
    } else {
      return [...this.inMemoryStore.users]
    }
  }

  // Sessions collection methods
  async createSession(sessionData) {
    const session = {
      ...sessionData,
      id: this.generateId(),
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + APP_CONFIG.SESSION_TIMEOUT)
    }

    if (this.useMongoDb) {
      const result = await this.db.collection('sessions').insertOne(session)
      return { ...session, _id: result.insertedId }
    } else {
      this.inMemoryStore.sessions.push(session)
      this.saveInMemoryData()
      return session
    }
  }

  async findSession(query) {
    if (this.useMongoDb) {
      return await this.db.collection('sessions').findOne(query)
    } else {
      return this.inMemoryStore.sessions.find(session => {
        return Object.keys(query).every(key => session[key] === query[key])
      })
    }
  }

  async deleteSession(query) {
    if (this.useMongoDb) {
      return await this.db.collection('sessions').deleteOne(query)
    } else {
      const sessionIndex = this.inMemoryStore.sessions.findIndex(session => {
        return Object.keys(query).every(key => session[key] === query[key])
      })
      if (sessionIndex !== -1) {
        this.inMemoryStore.sessions.splice(sessionIndex, 1)
        this.saveInMemoryData()
        return { deletedCount: 1 }
      }
      return { deletedCount: 0 }
    }
  }

  // Logs collection methods
  async createLog(logData) {
    const log = {
      ...logData,
      id: this.generateId(),
      timestamp: new Date()
    }

    if (this.useMongoDb) {
      const result = await this.db.collection('logs').insertOne(log)
      return { ...log, _id: result.insertedId }
    } else {
      this.inMemoryStore.logs.push(log)
      this.saveInMemoryData()
      return log
    }
  }

  async getLogs(filter = {}, limit = 100) {
    if (this.useMongoDb) {
      return await this.db.collection('logs')
        .find(filter)
        .sort({ timestamp: -1 })
        .limit(limit)
        .toArray()
    } else {
      let logs = [...this.inMemoryStore.logs]
      
      // Apply filter
      if (Object.keys(filter).length > 0) {
        logs = logs.filter(log => {
          return Object.keys(filter).every(key => log[key] === filter[key])
        })
      }
      
      // Sort by timestamp descending and limit
      return logs
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit)
    }
  }

  // Comments collection methods (for XSS challenge)
  async createComment(commentData) {
    const comment = {
      ...commentData,
      id: this.generateId(),
      createdAt: new Date()
    }

    if (this.useMongoDb) {
      const result = await this.db.collection('comments').insertOne(comment)
      return { ...comment, _id: result.insertedId }
    } else {
      this.inMemoryStore.comments.push(comment)
      this.saveInMemoryData()
      return comment
    }
  }

  async getComments(filter = {}) {
    if (this.useMongoDb) {
      return await this.db.collection('comments')
        .find(filter)
        .sort({ createdAt: -1 })
        .toArray()
    } else {
      let comments = [...this.inMemoryStore.comments]
      
      if (Object.keys(filter).length > 0) {
        comments = comments.filter(comment => {
          return Object.keys(filter).every(key => comment[key] === filter[key])
        })
      }
      
      return comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }
  }

  // Files collection methods (for IDOR challenge)
  async createFile(fileData) {
    const file = {
      ...fileData,
      id: this.generateId(),
      createdAt: new Date()
    }

    if (this.useMongoDb) {
      const result = await this.db.collection('files').insertOne(file)
      return { ...file, _id: result.insertedId }
    } else {
      this.inMemoryStore.files.push(file)
      this.saveInMemoryData()
      return file
    }
  }

  async findFile(query) {
    if (this.useMongoDb) {
      return await this.db.collection('files').findOne(query)
    } else {
      return this.inMemoryStore.files.find(file => {
        return Object.keys(query).every(key => file[key] === query[key])
      })
    }
  }

  async getAllFiles() {
    if (this.useMongoDb) {
      return await this.db.collection('files').find({}).toArray()
    } else {
      return [...this.inMemoryStore.files]
    }
  }

  // Flag tracking methods
  async captureFlag(userId, challengeId, subtaskId, flag) {
    const flagData = {
      userId,
      challengeId,
      subtaskId,
      flag,
      id: this.generateId(),
      capturedAt: new Date()
    }

    if (this.useMongoDb) {
      const result = await this.db.collection('flags').insertOne(flagData)
      return { ...flagData, _id: result.insertedId }
    } else {
      this.inMemoryStore.flags.push(flagData)
      this.saveInMemoryData()
      return flagData
    }
  }

  async getUserFlags(userId) {
    if (this.useMongoDb) {
      return await this.db.collection('flags').find({ userId }).toArray()
    } else {
      return this.inMemoryStore.flags.filter(flag => flag.userId === userId)
    }
  }

  async resetUserFlags(userId) {
    if (this.useMongoDb) {
      return await this.db.collection('flags').deleteMany({ userId })
    } else {
      this.inMemoryStore.flags = this.inMemoryStore.flags.filter(flag => flag.userId !== userId)
      this.saveInMemoryData()
      return { deletedCount: this.inMemoryStore.flags.length }
    }
  }

  // Utility methods
  generateId() {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
  }

  // Intentionally vulnerable SQL-like query method for SQL injection challenge
  // WARNING: This is intentionally insecure for educational purposes only!
  vulnerableQuery(query, params = []) {
    // Simulate SQL injection vulnerability by string concatenation
    let sql = query
    params.forEach(param => {
      sql = sql.replace('?', param)
    })
    
    // Log the "executed" query for detection purposes
    console.log('Vulnerable query executed:', sql)
    
    // Simple detection for common SQL injection patterns
    const injectionPatterns = [
      /union\s+select/i,
      /or\s+1\s*=\s*1/i,
      /'\s*or\s*'.*'='.*/i,
      /admin'\s*--/i,
      /sleep\(/i,
      /benchmark\(/i
    ]
    
    const isInjection = injectionPatterns.some(pattern => pattern.test(sql))
    
    return {
      query: sql,
      isVulnerable: isInjection,
      executedAt: new Date()
    }
  }
}

// Singleton instance
const dbManager = new DatabaseManager()

export default dbManager