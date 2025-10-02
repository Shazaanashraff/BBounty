'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { File, User, Download, AlertCircle } from 'lucide-react'

export default function IDORChallenge({ onFlagCapture }) {
  const [userId, setUserId] = useState('2')
  const [fileResult, setFileResult] = useState('')
  
  // Simulated user files (IDOR vulnerability - predictable IDs)
  const userFiles = {
    '1': { 
      user: 'admin', 
      files: [
        { name: 'admin_notes.txt', content: 'CTF{1d0r_vuln3r4b1l1ty} - Admin secret file' },
        { name: 'system_config.txt', content: 'Database: prod_db\nAPI_KEY: sk_prod_12345' }
      ]
    },
    '2': { 
      user: 'john_doe', 
      files: [
        { name: 'personal.txt', content: 'My personal notes for today...' },
        { name: 'shopping_list.txt', content: 'Milk, Bread, Eggs, Coffee' }
      ]
    },
    '3': { 
      user: 'jane_smith', 
      files: [
        { name: 'project_ideas.txt', content: 'New mobile app concepts and wireframes' },
        { name: 'meeting_notes.txt', content: 'Q4 planning meeting summary' }
      ]
    }
  }

  const handleViewFiles = () => {
    const userData = userFiles[userId]
    if (userData) {
      setFileResult(`Accessing files for user: ${userData.user} (ID: ${userId})`)
      
      // Check if accessing admin files
      if (userId === '1' && userData.files.some(f => f.content.includes('CTF{'))) {
        setTimeout(() => onFlagCapture(), 1500)
      }
    } else {
      setFileResult('User not found')
    }
  }

  const handleDirectAccess = (targetUserId) => {
    setUserId(targetUserId)
    const userData = userFiles[targetUserId]
    if (userData) {
      setFileResult(`🚨 IDOR Attack: Directly accessing User ${targetUserId} files`)
      if (targetUserId === '1') {
        setTimeout(() => onFlagCapture(), 1500)
      }
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Challenge Info */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">🎯 Your Mission</h2>
          <div className="space-y-4 text-gray-300">
            <p>
              This file management system has an IDOR (Insecure Direct Object Reference) 
              vulnerability. Access files from other users by manipulating the user ID parameter.
            </p>
            
            <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
              <h3 className="text-blue-400 font-semibold mb-2">💡 Hints:</h3>
              <ul className="space-y-2 text-sm">
                <li>• Try changing the user ID to access other users' files</li>
                <li>• User IDs are predictable sequential numbers</li>
                <li>• The admin user likely has ID = 1</li>
                <li>• Look for sensitive information in admin files</li>
              </ul>
            </div>

            <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
              <h3 className="text-yellow-400 font-semibold mb-2">🎯 Available Users:</h3>
              <ul className="space-y-1 text-sm">
                <li>• ID 1: admin (restricted access)</li>
                <li>• ID 2: john_doe (your account)</li>
                <li>• ID 3: jane_smith</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Vulnerable File Access */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <File className="w-6 h-6 text-primary-400" />
            <h2 className="text-xl font-bold text-white">Personal File Manager</h2>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-3">
              <p className="text-blue-300 text-sm">
                👤 Currently logged in as: <strong>john_doe</strong> (User ID: 2)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                User ID to Access:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="flex-1 p-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
                  placeholder="Enter user ID"
                />
                <button
                  onClick={handleViewFiles}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Access Files
                </button>
              </div>
            </div>

            {/* Quick Access Buttons */}
            <div className="border-t border-gray-700 pt-4">
              <p className="text-sm text-gray-400 mb-3">Quick Access (IDOR Exploit):</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDirectAccess('1')}
                  className="bg-red-600/20 hover:bg-red-600/30 border border-red-600/50 text-red-300 px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  🚨 Access Admin Files
                </button>
                <button
                  onClick={() => handleDirectAccess('3')}
                  className="bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-600/50 text-yellow-300 px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  👥 Access jane_smith
                </button>
              </div>
            </div>

            {/* File Display */}
            {userId && userFiles[userId] && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900 border border-gray-600 rounded-lg p-4"
              >
                <h4 className="text-lg font-semibold text-white mb-3">
                  Files for {userFiles[userId].user}
                </h4>
                <div className="space-y-3">
                  {userFiles[userId].files.map((file, index) => (
                    <div key={index} className="border border-gray-700 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <File className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-white">{file.name}</span>
                      </div>
                      <div className="bg-gray-800 p-3 rounded text-sm text-gray-300 font-mono">
                        {file.content}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {fileResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-gray-900 border border-gray-600 rounded-lg"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-300 mb-2">Access Log:</p>
                    <code className="text-xs text-yellow-300">{fileResult}</code>
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