'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, User, AlertCircle, CheckCircle } from 'lucide-react'

export default function SQLInjectionChallenge({ onFlagCapture }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [result, setResult] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Simulate vulnerable database users
  const users = [
    { id: 1, username: 'admin', password: 'admin123', role: 'administrator' },
    { id: 2, username: 'user', password: 'password', role: 'user' },
    { id: 3, username: 'guest', password: 'guest', role: 'guest' }
  ]

  const handleLogin = (e) => {
    e.preventDefault()
    
    // Vulnerable SQL query simulation (for educational purposes)
    const query = `SELECT * FROM users WHERE username='${username}' AND password='${password}'`
    
    console.log('Executing query:', query)
    setResult(`Query executed: ${query}`)

    // Check for SQL injection attempts
    const lowerUsername = username.toLowerCase()
    const lowerPassword = password.toLowerCase()

    // Basic SQL injection detection
    if (
      (lowerUsername.includes("' or ") || lowerUsername.includes("'or") || 
       lowerUsername.includes("' union") || lowerUsername.includes("'union") ||
       lowerUsername.includes("admin'--") || lowerUsername.includes("admin'#") ||
       lowerPassword.includes("' or '1'='1") || lowerPassword.includes("'or'1'='1") ||
       username === "admin'--" || username === "admin'#" ||
       password === "' or '1'='1'--" || password === "' or 1=1--")
    ) {
      setIsLoggedIn(true)
      setResult('🎉 SQL Injection successful! You bypassed authentication!')
      setTimeout(() => {
        onFlagCapture()
      }, 1500)
      return
    }

    // Normal authentication check
    const user = users.find(u => u.username === username && u.password === password)
    if (user) {
      setIsLoggedIn(true)
      setResult(`Welcome ${user.username}! Role: ${user.role}`)
    } else {
      setResult('❌ Invalid credentials. Try again!')
    }
  }

  const reset = () => {
    setUsername('')
    setPassword('')
    setResult('')
    setIsLoggedIn(false)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Challenge Description */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">🎯 Your Mission</h2>
          <div className="space-y-4 text-gray-300">
            <p>
              This login form is vulnerable to SQL injection attacks. Your goal is to bypass 
              the authentication mechanism without knowing valid credentials.
            </p>
            <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
              <h3 className="text-blue-400 font-semibold mb-2">💡 Hints:</h3>
              <ul className="space-y-2 text-sm">
                <li>• Try using SQL comments like <code className="bg-gray-700 px-1 rounded">--</code> or <code className="bg-gray-700 px-1 rounded">#</code></li>
                <li>• Consider the classic <code className="bg-gray-700 px-1 rounded">' or '1'='1</code> technique</li>
                <li>• Remember that <code className="bg-gray-700 px-1 rounded">admin'--</code> might work in the username field</li>
                <li>• Think about how SQL WHERE clauses work</li>
              </ul>
            </div>
            <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
              <h3 className="text-yellow-400 font-semibold mb-2">⚠️ Example Payloads:</h3>
              <ul className="space-y-1 text-sm font-mono">
                <li>Username: <code className="bg-gray-700 px-1 rounded">admin'--</code></li>
                <li>Password: <code className="bg-gray-700 px-1 rounded">' or '1'='1'--</code></li>
                <li>Username: <code className="bg-gray-700 px-1 rounded">' or 1=1--</code></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Vulnerable Login Form */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-6 h-6 text-primary-400" />
            <h2 className="text-xl font-bold text-white">Corporate Login Portal</h2>
          </div>

          {!isLoggedIn ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
                    placeholder="Enter username"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
                    placeholder="Enter password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Sign In
              </button>
            </form>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-success-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-success-400 mb-2">Access Granted!</h3>
              <p className="text-gray-300 mb-4">Welcome to the admin dashboard</p>
              <button
                onClick={reset}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-gray-900 border border-gray-600 rounded-lg"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-300 mb-2">Debug Output:</p>
                  <code className="text-xs text-yellow-300 break-all">{result}</code>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}