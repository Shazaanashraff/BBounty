// Seed script for WebSec CTF Platform
// This script initializes the database with sample data for testing

const { MongoClient } = require('mongodb')
const bcrypt = require('bcryptjs')
const { v4: uuidv4 } = require('uuid')

// Environment configuration
const config = {
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET || 'insecure-jwt-secret-for-demo',
  ADMIN_USER: process.env.ADMIN_USER || 'admin',
  ADMIN_PASS: process.env.ADMIN_PASS || 'admin123'
}

// Sample data
const sampleUsers = [
  {
    email: 'admin@ctf.local',
    password: 'admin123',
    role: 'admin',
    name: 'Admin User'
  },
  {
    email: 'student@example.com', 
    password: 'password123',
    role: 'user',
    name: 'Student User'
  },
  {
    email: 'test@example.com',
    password: 'test123',
    role: 'user', 
    name: 'Test User'
  }
]

const sampleComments = [
  {
    author: 'John Doe',
    content: 'This is a normal comment about web security.',
    timestamp: new Date()
  },
  {
    author: 'Jane Smith', 
    content: 'I love learning about CTF challenges!',
    timestamp: new Date()
  },
  {
    author: 'Security Expert',
    content: 'Remember to always validate user input and sanitize outputs.',
    timestamp: new Date()
  }
]

const sampleFiles = [
  {
    id: 1,
    name: 'public-document.txt',
    content: 'This is a public document available to all users.',
    owner: 'admin',
    isPrivate: false,
    createdAt: new Date()
  },
  {
    id: 2,
    name: 'private-notes.txt', 
    content: 'These are private notes containing sensitive information: API_KEY=sk-1234567890',
    owner: 'student@example.com',
    isPrivate: true,
    createdAt: new Date()
  },
  {
    id: 3,
    name: 'admin-config.json',
    content: '{"database_password": "super_secret_123", "admin_token": "admin_token_xyz"}',
    owner: 'admin@ctf.local',
    isPrivate: true,
    createdAt: new Date()
  }
]

async function seedDatabase() {
  let client = null
  
  try {
    console.log('🌱 Starting database seeding...')
    
    if (config.MONGODB_URI) {
      console.log('📡 Connecting to MongoDB...')
      client = new MongoClient(config.MONGODB_URI)
      await client.connect()
      
      const db = client.db('websec-ctf')
      
      // Clear existing data
      console.log('🗑️  Clearing existing data...')
      await db.collection('users').deleteMany({})
      await db.collection('comments').deleteMany({})  
      await db.collection('files').deleteMany({})
      await db.collection('logs').deleteMany({})
      await db.collection('sessions').deleteMany({})
      await db.collection('flags').deleteMany({})
      
      // Seed users
      console.log('👥 Seeding users...')
      for (const user of sampleUsers) {
        const hashedPassword = await bcrypt.hash(user.password, 12)
        const weakHash = Buffer.from(user.password + 'salt123').toString('base64')
        
        await db.collection('users').insertOne({
          id: uuidv4(),
          email: user.email,
          passwordHash: hashedPassword,
          weakPasswordHash: weakHash, // For crypto challenge
          role: user.role,
          name: user.name,
          createdAt: new Date(),
          loginAttempts: 0,
          isLocked: false
        })
      }
      
      // Seed comments  
      console.log('💬 Seeding comments...')
      for (const comment of sampleComments) {
        await db.collection('comments').insertOne({
          id: uuidv4(),
          ...comment
        })
      }
      
      // Seed files
      console.log('📄 Seeding files...')
      for (const file of sampleFiles) {
        await db.collection('files').insertOne({
          ...file,
          id: file.id.toString()
        })
      }
      
      // Create initial log entries
      console.log('📝 Creating initial logs...')
      await db.collection('logs').insertOne({
        id: uuidv4(),
        type: 'system',
        message: 'Database seeded successfully',
        timestamp: new Date()
      })
      
      console.log('✅ MongoDB seeding completed!')
      
    } else {
      console.log('💾 No MongoDB URI provided, using in-memory storage')
      console.log('ℹ️  Sample data will be created when the application starts')
    }
    
    // Create sample .env file if it doesn't exist
    const fs = require('fs')
    const path = require('path')
    
    const envPath = path.join(process.cwd(), '.env.local')
    if (!fs.existsSync(envPath)) {
      console.log('📝 Creating .env.local file...')
      const envContent = `# WebSec CTF Environment Configuration
JWT_SECRET=${config.JWT_SECRET}
ADMIN_USER=${config.ADMIN_USER}  
ADMIN_PASS=${config.ADMIN_PASS}
${config.MONGODB_URI ? `MONGODB_URI=${config.MONGODB_URI}` : '# MONGODB_URI=mongodb://localhost:27017/websec-ctf'}
NODE_ENV=development
`
      fs.writeFileSync(envPath, envContent)
      console.log('✅ .env.local created!')
    }
    
    console.log('\n🎯 Seeding Summary:')
    console.log(`👥 Users: ${sampleUsers.length} created`)
    console.log(`💬 Comments: ${sampleComments.length} created`)  
    console.log(`📄 Files: ${sampleFiles.length} created`)
    console.log('\n🔐 Admin Credentials:')
    console.log(`Email: ${config.ADMIN_USER}@ctf.local`)
    console.log(`Password: ${config.ADMIN_PASS}`)
    console.log('\n🚀 You can now start the development server with: npm run dev')
    
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  } finally {
    if (client) {
      await client.close()
    }
  }
}

// Handle command line arguments
const args = process.argv.slice(2)
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
WebSec CTF Database Seeding Script

Usage: node scripts/seed.js [options]

Options:
  --help, -h     Show this help message
  --force        Force reseed even in production
  
Environment Variables:
  MONGODB_URI    MongoDB connection string (optional)
  JWT_SECRET     JWT signing secret
  ADMIN_USER     Admin username (default: admin)
  ADMIN_PASS     Admin password (default: admin123)

Examples:
  node scripts/seed.js
  MONGODB_URI=mongodb://localhost:27017/ctf node scripts/seed.js
  `)
  process.exit(0)
}

// Safety check for production
if (process.env.NODE_ENV === 'production' && !args.includes('--force')) {
  console.error('❌ Seeding is disabled in production environment for safety.')
  console.error('   Use --force flag if you really want to seed production data.')
  process.exit(1)
}

// Run seeding
seedDatabase().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})