'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Shield, AlertTriangle, Book } from 'lucide-react'

export default function LegalBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [accepted, setAccepted] = useState(false)

  useEffect(() => {
    const hasAccepted = localStorage.getItem('ctf-legal-accepted')
    if (!hasAccepted) {
      setShowBanner(true)
    } else {
      setAccepted(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('ctf-legal-accepted', 'true')
    setAccepted(true)
    setShowBanner(false)
  }

  const handleDecline = () => {
    window.location.href = 'https://www.google.com'
  }

  if (!showBanner && accepted) return null

  return (
    <AnimatePresence>
      {showBanner && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-gray-900 border border-red-500/50 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-red-500/20">
              <div className="p-8">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-red-500/20 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-red-400" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">Security Training Platform</h1>
                    <p className="text-gray-400 text-sm">Terms & Conditions</p>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-6 text-gray-300">
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-red-400 mb-2">Important Notice</h3>
                        <p className="text-sm">
                          This platform contains intentional vulnerabilities for training purposes. 
                          Use only in authorized environments for learning web security.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary-400 rounded-full mt-2 flex-shrink-0"></div>
                      <p><strong>Educational Use:</strong> Only use for authorized security training and learning</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary-400 rounded-full mt-2 flex-shrink-0"></div>
                      <p><strong>Controlled Environment:</strong> Deploy only in isolated, secure environments</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary-400 rounded-full mt-2 flex-shrink-0"></div>
                      <p><strong>Responsible Use:</strong> Practice ethical hacking and responsible disclosure</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary-400 rounded-full mt-2 flex-shrink-0"></div>
                      <p><strong>No Liability:</strong> Users are responsible for proper and legal usage</p>
                    </div>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <p className="text-sm">
                      By continuing, you agree to use this platform responsibly for security training only.
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-8">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAccept}
                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                  >
                    I Accept - Continue to Platform
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDecline}
                    className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-medium transition-colors"
                  >
                    Decline
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}