'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { CHALLENGE_CONFIG } from '../../lib/config'
import { 
  Database, 
  Shield, 
  Key, 
  FileText, 
  Code, 
  Terminal,
  Search,
  Filter,
  Trophy,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Flag
} from 'lucide-react'

const challengeIcons = {
  'sql-injection': Database,
  'broken-access-control': Shield,
  'cryptographic-failures': Key,
  'idor': FileText,
  'stored-xss': Code,
  'command-injection': Terminal
}

const difficultyColors = {
  beginner: 'bg-green-600/20 text-green-400 border-green-600/30',
  intermediate: 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30',
  advanced: 'bg-red-600/20 text-red-400 border-red-600/30'
}

const difficultyIcons = {
  beginner: Trophy,
  intermediate: Target,
  advanced: AlertTriangle
}

export default function ChallengesPage() {
  const [userFlags, setUserFlags] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')

  useEffect(() => {
    loadUserFlags()
  }, [])

  const loadUserFlags = () => {
    const savedFlags = localStorage.getItem('ctf-flags')
    if (savedFlags) {
      const flags = JSON.parse(savedFlags)
      setUserFlags(flags)
    }
  }

  const challenges = Object.values(CHALLENGE_CONFIG)

  // Filter challenges based on search and filters
  const filteredChallenges = challenges.filter(challenge => {
    const matchesSearch = challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         challenge.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesDifficulty = selectedDifficulty === 'all' || challenge.difficulty === selectedDifficulty
    
    const completedSubtasks = challenge.subtasks.filter(subtask => 
      userFlags.some(flag => flag.challengeId === challenge.id && flag.subtaskId === subtask.id)
    )
    const isCompleted = completedSubtasks.length === challenge.subtasks.length
    const isInProgress = completedSubtasks.length > 0 && !isCompleted
    
    let matchesStatus = true
    if (selectedStatus === 'completed') matchesStatus = isCompleted
    else if (selectedStatus === 'in-progress') matchesStatus = isInProgress
    else if (selectedStatus === 'not-started') matchesStatus = completedSubtasks.length === 0

    return matchesSearch && matchesDifficulty && matchesStatus
  })

  // Calculate stats
  const stats = {
    total: challenges.length,
    completed: challenges.filter(challenge => {
      const completedSubtasks = challenge.subtasks.filter(subtask => 
        userFlags.some(flag => flag.challengeId === challenge.id && flag.subtaskId === subtask.id)
      )
      return completedSubtasks.length === challenge.subtasks.length
    }).length,
    inProgress: challenges.filter(challenge => {
      const completedSubtasks = challenge.subtasks.filter(subtask => 
        userFlags.some(flag => flag.challengeId === challenge.id && flag.subtaskId === subtask.id)
      )
      return completedSubtasks.length > 0 && completedSubtasks.length < challenge.subtasks.length
    }).length,
    totalFlags: userFlags.length
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-purple-600/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Security <span className="bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">Challenges</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Test your skills against real-world web application vulnerabilities. Each challenge is designed 
              to teach you about common security flaws and how to exploit them safely.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4"
              >
                <Target className="w-8 h-8 text-primary-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{stats.total}</p>
                <p className="text-sm text-gray-400">Total Challenges</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4"
              >
                <CheckCircle className="w-8 h-8 text-success-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{stats.completed}</p>
                <p className="text-sm text-gray-400">Completed</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4"
              >
                <Clock className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{stats.inProgress}</p>
                <p className="text-sm text-gray-400">In Progress</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4"
              >
                <Flag className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{stats.totalFlags}</p>
                <p className="text-sm text-gray-400">Flags Captured</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search challenges..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-colors"
              />
            </div>

            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-primary-500 transition-colors"
            >
              <option value="all">All Difficulties</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-primary-500 transition-colors"
            >
              <option value="all">All Status</option>
              <option value="not-started">Not Started</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </motion.div>

        {/* Challenges Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
        >
          {filteredChallenges.map((challenge, index) => {
            const Icon = challengeIcons[challenge.id] || Target
            const DifficultyIcon = difficultyIcons[challenge.difficulty]
            
            const completedSubtasks = challenge.subtasks.filter(subtask => 
              userFlags.some(flag => flag.challengeId === challenge.id && flag.subtaskId === subtask.id)
            )
            const progress = (completedSubtasks.length / challenge.subtasks.length) * 100
            const isCompleted = completedSubtasks.length === challenge.subtasks.length

            return (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group"
              >
                <Link href={`/challenges/${challenge.id}`}>
                  <div className="relative bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 h-full hover:border-primary-500/50 transition-all duration-300 overflow-hidden min-h-[400px]">
                    {/* Background glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Completion badge */}
                    {isCompleted && (
                      <div className="absolute top-4 right-4">
                        <div className="bg-success-600/20 text-success-400 p-2 rounded-full">
                          <CheckCircle className="w-5 h-5" />
                        </div>
                      </div>
                    )}

                    <div className="relative flex flex-col h-full">
                      {/* Header */}
                      <div className="flex items-start gap-4 mb-6">
                        <div className="p-4 bg-primary-600/20 rounded-xl">
                          <Icon className="w-8 h-8 text-primary-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary-300 transition-colors">
                            {challenge.title}
                          </h3>
                          <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${difficultyColors[challenge.difficulty]}`}>
                            <DifficultyIcon className="w-3 h-3" />
                            {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-gray-400 mb-6 leading-relaxed flex-grow">
                        {challenge.description}
                      </p>

                      {/* Progress */}
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-gray-300">Progress</span>
                          <span className="text-sm text-gray-400">
                            {completedSubtasks.length}/{challenge.subtasks.length} tasks
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <motion.div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              isCompleted 
                                ? 'bg-success-500' 
                                : progress > 0 
                                  ? 'bg-primary-500' 
                                  : 'bg-gray-600'
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Quick task indicators */}
                      <div className="grid grid-cols-3 gap-2 mb-6">
                        {challenge.subtasks.slice(0, 3).map((subtask, subtaskIndex) => {
                          const isSubtaskCompleted = userFlags.some(flag => 
                            flag.challengeId === challenge.id && flag.subtaskId === subtask.id
                          )
                          
                          return (
                            <div
                              key={subtask.id}
                              className={`h-2 rounded-full transition-all duration-300 ${
                                isSubtaskCompleted 
                                  ? 'bg-success-500' 
                                  : 'bg-gray-700'
                              }`}
                              title={subtask.title}
                            />
                          )
                        })}
                      </div>

                      {/* Action indicator */}
                      <div className="flex items-center justify-between border-t border-gray-700/50 pt-4 mt-auto">
                        <div className="text-sm text-gray-500">
                          {isCompleted ? 'Challenge Completed' : 'Click to start challenge'}
                        </div>
                        <motion.div
                          className="text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          whileHover={{ x: 5 }}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </motion.div>

        {/* No results */}
        {filteredChallenges.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center py-16"
          >
            <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-400 mb-2">No challenges found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}