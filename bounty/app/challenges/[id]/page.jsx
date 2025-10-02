'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Flag, CheckCircle } from 'lucide-react'

// Vulnerable challenge components
import SQLInjectionChallenge from './components/SQLInjectionChallenge'
import BrokenAccessControlChallenge from './components/BrokenAccessControlChallenge'
import CryptographicFailuresChallenge from './components/CryptographicFailuresChallenge'
import IDORChallenge from './components/IDORChallenge'
import StoredXSSChallenge from './components/StoredXSSChallenge'
import CommandInjectionChallenge from './components/CommandInjectionChallenge'

const challengeComponents = {
  'sql-injection': SQLInjectionChallenge,
  'broken-access-control': BrokenAccessControlChallenge,
  'cryptographic-failures': CryptographicFailuresChallenge,
  'idor': IDORChallenge,
  'stored-xss': StoredXSSChallenge,
  'command-injection': CommandInjectionChallenge
}

const challengeInfo = {
  'sql-injection': {
    title: 'SQL Injection Challenge',
    description: 'Exploit SQL injection vulnerabilities to bypass authentication and extract data',
    flag: 'CTF{sql_1nj3ct10n_m4st3r}'
  },
  'broken-access-control': {
    title: 'Broken Access Control Challenge', 
    description: 'Bypass authorization checks to access restricted resources',
    flag: 'CTF{br0k3n_4cc3ss_c0ntr0l}'
  },
  'cryptographic-failures': {
    title: 'Cryptographic Failures Challenge',
    description: 'Exploit weak cryptographic implementations to recover sensitive data',
    flag: 'CTF{w34k_crypt0_f41ls}'
  },
  'idor': {
    title: 'IDOR Challenge',
    description: 'Exploit insecure direct object references to access other users data',
    flag: 'CTF{1d0r_vuln3r4b1l1ty}'
  },
  'stored-xss': {
    title: 'Stored XSS Challenge',
    description: 'Inject malicious scripts that persist and execute for other users',
    flag: 'CTF{st0r3d_xss_4tt4ck}'
  },
  'command-injection': {
    title: 'Command Injection Challenge',
    description: 'Execute arbitrary commands on the server through vulnerable input',
    flag: 'CTF{c0mm4nd_1nj3ct10n}'
  }
}

export default function ChallengePage() {
  const params = useParams()
  const router = useRouter()
  const challengeId = params.id
  const [capturedFlag, setCapturedFlag] = useState(false)

  const challenge = challengeInfo[challengeId]
  const ChallengeComponent = challengeComponents[challengeId]

  if (!challenge || !ChallengeComponent) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Challenge not found</h1>
          <button 
            onClick={() => router.push('/challenges')}
            className="text-primary-400 hover:text-primary-300 transition-colors"
          >
            ← Back to challenges
          </button>
        </div>
      </div>
    )
  }

  const handleFlagCapture = () => {
    setCapturedFlag(true)
    // Save flag to localStorage
    const existingFlags = JSON.parse(localStorage.getItem('ctf-flags') || '[]')
    const newFlag = {
      challengeId,
      flag: challenge.flag,
      timestamp: new Date().toISOString()
    }
    const updatedFlags = [...existingFlags.filter(f => f.challengeId !== challengeId), newFlag]
    localStorage.setItem('ctf-flags', JSON.stringify(updatedFlags))
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/challenges')}
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Challenges
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">{challenge.title}</h1>
                <p className="text-gray-400">{challenge.description}</p>
              </div>
            </div>
            
            {capturedFlag && (
              <div className="flex items-center gap-2 bg-success-600/20 text-success-400 px-4 py-2 rounded-lg border border-success-600/30">
                <Flag className="w-5 h-5" />
                <span className="font-medium">Flag Captured!</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Challenge Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ChallengeComponent onFlagCapture={handleFlagCapture} />
        
        {capturedFlag && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-success-600/10 border border-success-600/30 rounded-lg p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-success-400" />
              <h3 className="text-lg font-bold text-success-400">Challenge Completed!</h3>
            </div>
            <p className="text-gray-300 mb-4">
              Congratulations! You successfully exploited the vulnerability and captured the flag.
            </p>
            <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 font-mono text-sm">
              <span className="text-gray-400">Flag: </span>
              <span className="text-success-400 font-bold">{challenge.flag}</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}