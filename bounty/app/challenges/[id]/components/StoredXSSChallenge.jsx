'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Send, AlertTriangle, Trash2, User } from 'lucide-react'

export default function StoredXSSChallenge({ onFlagCapture }) {
  const [comments, setComments] = useState([
    { id: 1, author: 'john_doe', content: 'Welcome to our comment system!', timestamp: new Date().toISOString() },
    { id: 2, author: 'admin', content: 'Please keep discussions respectful.', timestamp: new Date().toISOString() }
  ])
  const [newComment, setNewComment] = useState('')
  const [author, setAuthor] = useState('user')

  // Check for XSS payloads and flag capture
  useEffect(() => {
    const checkForXSS = () => {
      const hasScriptTag = comments.some(comment => 
        comment.content.toLowerCase().includes('<script') || 
        comment.content.toLowerCase().includes('javascript:') ||
        comment.content.toLowerCase().includes('onerror') ||
        comment.content.toLowerCase().includes('onload') ||
        comment.content.toLowerCase().includes('onclick')
      )
      
      if (hasScriptTag) {
        setTimeout(() => {
          onFlagCapture()
        }, 2000)
      }
    }
    
    checkForXSS()
  }, [comments, onFlagCapture])

  const handleSubmitComment = (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    const comment = {
      id: Date.now(),
      author: author,
      content: newComment, // Vulnerable: Not sanitizing input!
      timestamp: new Date().toISOString()
    }

    setComments(prev => [...prev, comment])
    setNewComment('')
  }

  const clearComments = () => {
    setComments([
      { id: 1, author: 'john_doe', content: 'Welcome to our comment system!', timestamp: new Date().toISOString() },
      { id: 2, author: 'admin', content: 'Please keep discussions respectful.', timestamp: new Date().toISOString() }
    ])
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Challenge Info */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">🎯 Your Mission</h2>
          <div className="space-y-4 text-gray-300">
            <p>
              This comment system is vulnerable to Stored XSS (Cross-Site Scripting) attacks. 
              Your goal is to inject malicious JavaScript that will execute when the page loads.
            </p>
            
            <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
              <h3 className="text-blue-400 font-semibold mb-2">💡 Hints:</h3>
              <ul className="space-y-2 text-sm">
                <li>• Try injecting <code className="bg-gray-700 px-1 rounded">&lt;script&gt;</code> tags</li>
                <li>• Use event handlers like <code className="bg-gray-700 px-1 rounded">onload</code> or <code className="bg-gray-700 px-1 rounded">onerror</code></li>
                <li>• The application doesn't sanitize user input</li>
                <li>• Your payload will be stored and executed for all users</li>
              </ul>
            </div>

            <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
              <h3 className="text-yellow-400 font-semibold mb-2">⚠️ Example Payloads:</h3>
              <div className="space-y-2 text-sm font-mono">
                <div>
                  <code className="bg-gray-700 px-1 rounded text-xs">
                    &lt;script&gt;alert('XSS')&lt;/script&gt;
                  </code>
                </div>
                <div>
                  <code className="bg-gray-700 px-1 rounded text-xs">
                    &lt;img src="x" onerror="alert('XSS')"&gt;
                  </code>
                </div>
                <div>
                  <code className="bg-gray-700 px-1 rounded text-xs">
                    &lt;svg onload="alert('XSS')"&gt;&lt;/svg&gt;
                  </code>
                </div>
              </div>
            </div>

            <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-4">
              <h3 className="text-red-400 font-semibold mb-2">🚨 Warning:</h3>
              <p className="text-sm">
                This is a controlled environment. In real applications, XSS can steal cookies, 
                session tokens, and perform actions on behalf of users.
              </p>
            </div>
          </div>
        </div>

        {/* Vulnerable Comment System */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <MessageSquare className="w-6 h-6 text-primary-400" />
            <h2 className="text-xl font-bold text-white">Community Comments</h2>
          </div>

          {/* Comment Form */}
          <form onSubmit={handleSubmitComment} className="mb-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Post as:
              </label>
              <select
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full p-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
              >
                <option value="user">User</option>
                <option value="guest">Guest</option>
                <option value="tester">Tester</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Your Comment:
              </label>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full h-24 p-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary-500 resize-none"
                placeholder="Write your comment here... (HTML allowed!)"
              />
            </div>
            
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
                Post Comment
              </button>
              <button
                type="button"
                onClick={clearComments}
                className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </button>
            </div>
          </form>

          {/* Comments Display */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
              Comments ({comments.length})
            </h3>
            
            {comments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900 border border-gray-600 rounded-lg p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-primary-400">{comment.author}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(comment.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                
                {/* VULNERABLE: Rendering raw HTML without sanitization */}
                <div 
                  className="text-gray-300 mt-2"
                  dangerouslySetInnerHTML={{ __html: comment.content }}
                />
              </motion.div>
            ))}
          </div>

          {/* XSS Detection Notice */}
          <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400 text-sm font-medium">
                Security Notice: This system does not sanitize HTML input!
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}