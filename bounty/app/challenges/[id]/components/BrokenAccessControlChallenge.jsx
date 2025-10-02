'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Shield, Eye, Lock, AlertCircle } from 'lucide-react'

export default function BrokenAccessControlChallenge({ onFlagCapture }) {
  const [currentUser, setCurrentUser] = useState({ id: 2, username: 'john_doe', role: 'user' })
  const [selectedUserId, setSelectedUserId] = useState(2)
  const [accessResult, setAccessResult] = useState('')

  const users = [
    { id: 1, username: 'admin', role: 'admin', profile: 'Administrator Account', secret: 'CTF{br0k3n_4cc3ss_c0ntr0l}' },
    { id: 2, username: 'john_doe', role: 'user', profile: 'Regular User Account', secret: 'user_secret_123' },
    { id: 3, username: 'jane_smith', role: 'user', profile: 'Regular User Account', secret: 'personal_notes_xyz' },
    { id: 4, username: 'guest', role: 'guest', profile: 'Guest Account', secret: 'no_access' }
  ]

  const handleViewProfile = (userId) => {
    const targetUser = users.find(u => u.id === userId)
    
    // Simulate broken access control - only checking client-side role
    if (currentUser.role === 'admin') {
      setAccessResult(`✅ Admin access: Viewing ${targetUser.username}'s profile`)
      if (targetUser.secret.includes('CTF{')) {
        setTimeout(() => onFlagCapture(), 1500)
      }
    } else if (userId === currentUser.id) {
      setAccessResult(`✅ Viewing your own profile`)
    } else {
      // This is where the vulnerability lies - it shows the result anyway!
      setAccessResult(`🔓 Accessing ${targetUser.username}'s profile (ID: ${userId})`)
      if (targetUser.secret.includes('CTF{')) {
        setTimeout(() => onFlagCapture(), 1500)
      }
    }
  }

  const handleDirectAccess = () => {
    // Simulate direct object reference vulnerability
    const adminUser = users.find(u => u.role === 'admin')
    setAccessResult(`🎯 Direct access to admin profile (bypassing authorization)`)
    setTimeout(() => onFlagCapture(), 1500)
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Challenge Info */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">🎯 Your Mission</h2>
          <div className="space-y-4 text-gray-300">
            <p>
              This application has broken access control. You need to access the administrator's 
              profile and find the secret information without having admin privileges.
            </p>
            
            <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
              <h3 className="text-blue-400 font-semibold mb-2">💡 Hints:</h3>
              <ul className="space-y-2 text-sm">
                <li>• Try changing the user ID parameter to access other profiles</li>
                <li>• Look for ways to bypass client-side authorization checks</li>
                <li>• The admin user has ID = 1</li>
                <li>• Sometimes direct object references can be manipulated</li>
              </ul>
            </div>

            <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
              <h3 className="text-yellow-400 font-semibold mb-2">⚠️ Current Status:</h3>
              <p className="text-sm">
                Logged in as: <span className="font-bold text-white">{currentUser.username}</span> 
                (Role: <span className="font-bold text-primary-400">{currentUser.role}</span>)
              </p>
            </div>
          </div>
        </div>

        {/* Vulnerable Application */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-primary-400" />
            <h2 className="text-xl font-bold text-white">User Management System</h2>
          </div>

          <div className="space-y-6">
            {/* User Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Select User Profile to View:
              </label>
              <div className="space-y-2">
                {users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => {
                      setSelectedUserId(user.id)
                      handleViewProfile(user.id)
                    }}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedUserId === user.id
                        ? 'bg-primary-600/20 border-primary-500/50 text-primary-300'
                        : 'bg-gray-900 border-gray-600 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5" />
                        <div>
                          <p className="font-medium">{user.username}</p>
                          <p className="text-sm text-gray-400">ID: {user.id} | Role: {user.role}</p>
                        </div>
                      </div>
                      {user.role === 'admin' && <Lock className="w-5 h-5 text-red-400" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Direct Admin Access Button */}
            <div className="border-t border-gray-700 pt-4">
              <button
                onClick={handleDirectAccess}
                className="w-full bg-red-600/20 hover:bg-red-600/30 border border-red-600/50 text-red-300 font-medium py-3 px-4 rounded-lg transition-colors"
              >
                🚨 Try Direct Admin Access (Exploit)
              </button>
            </div>

            {/* Profile Display */}
            {selectedUserId && (
              <div className="bg-gray-900 border border-gray-600 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Profile Information</h3>
                {(() => {
                  const selectedUser = users.find(u => u.id === selectedUserId)
                  return (
                    <div className="space-y-3">
                      <div>
                        <span className="text-gray-400">Username: </span>
                        <span className="text-white font-medium">{selectedUser.username}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Role: </span>
                        <span className={`font-medium ${
                          selectedUser.role === 'admin' ? 'text-red-400' : 'text-primary-400'
                        }`}>
                          {selectedUser.role}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Profile: </span>
                        <span className="text-white">{selectedUser.profile}</span>
                      </div>
                      
                      {/* Show secret if accessed */}
                      {(currentUser.role === 'admin' || selectedUserId !== currentUser.id) && (
                        <div className="mt-4 p-3 bg-red-900/20 border border-red-600/30 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Eye className="w-4 h-4 text-red-400" />
                            <span className="text-red-400 font-semibold">Secret Information:</span>
                          </div>
                          <code className="text-yellow-300 text-sm font-mono">
                            {selectedUser.secret}
                          </code>
                        </div>
                      )}
                    </div>
                  )
                })()}
              </div>
            )}

            {accessResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-gray-900 border border-gray-600 rounded-lg"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-300 mb-2">Access Log:</p>
                    <code className="text-xs text-yellow-300">{accessResult}</code>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}