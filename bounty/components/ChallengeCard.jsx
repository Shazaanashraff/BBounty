'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  Database, 
  Shield, 
  Key, 
  FileText, 
  Code, 
  Terminal,
  Trophy,
  Target,
  AlertTriangle,
  CheckCircle
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

export default function ChallengeCard({ challenge, userFlags = [], index }) {
  const Icon = challengeIcons[challenge.id] || Target
  const completedSubtasks = challenge.subtasks.filter(subtask => 
    userFlags.some(flag => flag.challengeId === challenge.id && flag.subtaskId === subtask.id)
  )
  const progress = (completedSubtasks.length / challenge.subtasks.length) * 100
  const isCompleted = completedSubtasks.length === challenge.subtasks.length

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="group"
    >
      <Link href={`/challenges/${challenge.id}`}>
        <div className="relative bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 h-full hover:border-primary-500/50 transition-all duration-300 overflow-hidden">
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

          <div className="relative">
            {/* Header */}
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-primary-600/20 rounded-xl">
                <Icon className="w-6 h-6 text-primary-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary-300 transition-colors">
                  {challenge.title}
                </h3>
                <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${difficultyColors[challenge.difficulty]}`}>
                  {challenge.difficulty === 'advanced' && <AlertTriangle className="w-3 h-3" />}
                  {challenge.difficulty === 'intermediate' && <Target className="w-3 h-3" />}
                  {challenge.difficulty === 'beginner' && <Trophy className="w-3 h-3" />}
                  {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-400 mb-4 leading-relaxed">
              {challenge.description}
            </p>

            {/* Hint */}
            <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-300">
                <span className="text-yellow-400 font-medium">Hint:</span> {challenge.hint}
              </p>
            </div>

            {/* Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
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

            {/* Subtasks */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Tasks:</h4>
              {challenge.subtasks.map((subtask, subtaskIndex) => {
                const isSubtaskCompleted = userFlags.some(flag => 
                  flag.challengeId === challenge.id && flag.subtaskId === subtask.id
                )
                
                return (
                  <div
                    key={subtask.id}
                    className={`flex items-center gap-2 text-sm p-2 rounded-lg transition-colors ${
                      isSubtaskCompleted 
                        ? 'bg-success-600/10 text-success-400' 
                        : 'bg-gray-800/30 text-gray-400'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${
                      isSubtaskCompleted ? 'bg-success-400' : 'bg-gray-500'
                    }`} />
                    <span>{subtask.title}</span>
                  </div>
                )
              })}
            </div>

            {/* Action indicator */}
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Click to start challenge
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
}