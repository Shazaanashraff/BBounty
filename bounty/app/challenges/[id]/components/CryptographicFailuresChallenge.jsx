'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Key, Copy, Eye, EyeOff } from 'lucide-react'

export default function CryptographicFailuresChallenge({ onFlagCapture }) {
  const [secretToken, setSecretToken] = useState('')
  const [decodedResult, setDecodedResult] = useState('')
  const [showToken, setShowToken] = useState(false)

  // Weak JWT-like token with the flag (Base64 encoded)
  const weakToken = btoa(JSON.stringify({
    user: 'admin',
    role: 'administrator', 
    secret: 'CTF{w34k_crypt0_f41ls}',
    exp: Date.now() + 3600000,
    algorithm: 'none' // Vulnerable: algorithm set to none
  }))

  const handleDecodeToken = () => {
    try {
      if (!secretToken) {
        setDecodedResult('Please enter a token to decode')
        return
      }

      // Try to decode as base64
      const decoded = atob(secretToken)
      const parsed = JSON.parse(decoded)
      
      setDecodedResult(JSON.stringify(parsed, null, 2))
      
      if (parsed.secret && parsed.secret.includes('CTF{')) {
        setTimeout(() => onFlagCapture(), 1500)
      }
    } catch (error) {
      setDecodedResult('Invalid token format. Try Base64 encoded data.')
    }
  }

  const copyWeakToken = () => {
    navigator.clipboard.writeText(weakToken)
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Challenge Info */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">🎯 Your Mission</h2>
          <div className="space-y-4 text-gray-300">
            <p>
              This application uses weak cryptographic implementations. You need to decode 
              the authentication token to reveal sensitive information.
            </p>
            
            <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
              <h3 className="text-blue-400 font-semibold mb-2">💡 Hints:</h3>
              <ul className="space-y-2 text-sm">
                <li>• The token might be using simple Base64 encoding</li>
                <li>• Look for weak algorithms like "none"</li>
                <li>• Try decoding the provided sample token</li>
                <li>• Check for sensitive data in plain text</li>
              </ul>
            </div>

            <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
              <h3 className="text-yellow-400 font-semibold mb-2">🔍 Sample Token:</h3>
              <div className="bg-gray-700 p-2 rounded text-xs font-mono break-all">
                {showToken ? weakToken : '•'.repeat(50) + '...'}
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => setShowToken(!showToken)}
                  className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                >
                  {showToken ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  {showToken ? 'Hide' : 'Show'} Token
                </button>
                <button
                  onClick={copyWeakToken}
                  className="flex items-center gap-1 text-xs text-green-400 hover:text-green-300"
                >
                  <Copy className="w-3 h-3" />
                  Copy Token
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Token Decoder */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <Key className="w-6 h-6 text-primary-400" />
            <h2 className="text-xl font-bold text-white">JWT Token Decoder</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Enter Token to Decode:
              </label>
              <textarea
                value={secretToken}
                onChange={(e) => setSecretToken(e.target.value)}
                className="w-full h-32 p-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary-500 resize-none font-mono text-sm"
                placeholder="Paste your JWT or Base64 token here..."
              />
            </div>

            <button
              onClick={handleDecodeToken}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Decode Token
            </button>

            {decodedResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900 border border-gray-600 rounded-lg p-4"
              >
                <h4 className="text-sm font-semibold text-white mb-2">Decoded Result:</h4>
                <pre className="text-xs text-green-400 font-mono overflow-auto whitespace-pre-wrap">
                  {decodedResult}
                </pre>
              </motion.div>
            )}

            <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-4">
              <h4 className="text-red-400 font-semibold mb-2">⚠️ Vulnerability:</h4>
              <p className="text-sm text-gray-300">
                This system stores sensitive data in easily decodable formats and uses 
                weak cryptographic algorithms. In production, use proper encryption!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}