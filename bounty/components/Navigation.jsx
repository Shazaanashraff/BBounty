'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, User, LogOut, Settings, Flag, Menu, X } from 'lucide-react'

export default function Navigation() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [flags, setFlags] = useState([])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    checkAuthStatus()
    loadFlags()
  }, [])

  const checkAuthStatus = () => {
    const token = localStorage.getItem('ctf-token')
    if (token) {
      try {
        // Basic JWT decode (just for display, not validation)
        const payload = JSON.parse(atob(token.split('.')[1]))
        setIsAuthenticated(true)
        setUser(payload)
      } catch (error) {
        localStorage.removeItem('ctf-token')
      }
    }
  }

  const loadFlags = () => {
    const savedFlags = localStorage.getItem('ctf-flags')
    if (savedFlags) {
      setFlags(JSON.parse(savedFlags))
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('ctf-token')
    localStorage.removeItem('ctf-flags')
    setIsAuthenticated(false)
    setUser(null)
    setFlags([])
    window.location.href = '/'
  }

  const navItems = [
    { href: '/', label: 'Challenges' },
    { href: '/leaderboard', label: 'Leaderboard' },
    { href: '/about', label: 'About' }
  ]

  return (
    <nav className="bg-gray-900/50 backdrop-blur-md border-b border-gray-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="p-2 bg-primary-600/20 rounded-lg">
              <Shield className="w-6 h-6 text-primary-400" />
            </div>
            <div>
              <h1 className="font-bold text-white text-lg">WebSec CTF</h1>
              <p className="text-xs text-gray-400 -mt-1">Training Platform</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-300 hover:text-white transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* User Section */}
          <div className="flex items-center gap-4">
            {/* Flags Counter */}
            {flags.length > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="hidden sm:flex items-center gap-2 bg-success-600/20 text-success-400 px-3 py-1 rounded-full text-sm font-medium"
              >
                <Flag className="w-4 h-4" />
                {flags.length}
              </motion.div>
            )}

            {/* Auth Section */}
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-white">{user?.email}</p>
                  <p className="text-xs text-gray-400">{user?.role}</p>
                </div>
                <div className="flex items-center gap-2">
                  {user?.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="p-2 bg-primary-600/20 hover:bg-primary-600/30 text-primary-400 rounded-lg transition-colors"
                      title="Admin Panel"
                    >
                      <Settings className="w-4 h-4" />
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden py-4 border-t border-gray-800"
          >
            <div className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              {flags.length > 0 && (
                <div className="px-4 py-2 flex items-center gap-2 text-success-400 text-sm">
                  <Flag className="w-4 h-4" />
                  {flags.length} Flags Captured
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  )
}