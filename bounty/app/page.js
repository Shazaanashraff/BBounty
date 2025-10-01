'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import ChallengeCard from '../components/ChallengeCard'
import { CHALLENGE_CONFIG } from '../lib/config'
import { Shield, Target, Trophy, Flag, Users, Activity } from 'lucide-react'

export default function Home() {
  const [userFlags, setUserFlags] = useState([])
  const [stats, setStats] = useState({
    totalChallenges: Object.keys(CHALLENGE_CONFIG).length,
    completedChallenges: 0,
    totalFlags: 0,
    difficulty: 'Beginner'
  })

  useEffect(() => {
    loadUserFlags()
  }, [])

  useEffect(() => {
    calculateStats()
  }, [userFlags])

  const loadUserFlags = () => {
    const savedFlags = localStorage.getItem('ctf-flags')
    if (savedFlags) {
      const flags = JSON.parse(savedFlags)
      setUserFlags(flags)
    }
  }

  const calculateStats = () => {
    const challenges = Object.values(CHALLENGE_CONFIG)
    const completedChallenges = challenges.filter(challenge => 
      challenge.subtasks.every(subtask => 
        userFlags.some(flag => flag.challengeId === challenge.id && flag.subtaskId === subtask.id)
      )
    ).length

    const difficultyLevel = userFlags.length < 3 ? 'Beginner' : 
                           userFlags.length < 8 ? 'Intermediate' : 'Advanced'

    setStats({
      totalChallenges: challenges.length,
      completedChallenges,
      totalFlags: userFlags.length,
      difficulty: difficultyLevel
    })
  }

  const challenges = Object.values(CHALLENGE_CONFIG)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-purple-600/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="my-16">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-12">
                Web Security
                <span className="block bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent mt-2">
                  Training Platform
                </span>
              </h1>
            </div>
            <p className="text-xl text-gray-300 mb-16 max-w-3xl mx-auto leading-relaxed">
              Master web application security through hands-on challenges. Learn to identify and exploit 
              common vulnerabilities in a controlled environment.
            </p>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mt-20">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6"
              >
                <Target className="w-10 h-10 text-primary-400 mx-auto mb-3" />
                <p className="text-2xl font-bold text-white">{stats.totalChallenges}</p>
                <p className="text-sm text-gray-400">Challenges</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6"
              >
                <Trophy className="w-10 h-10 text-success-400 mx-auto mb-3" />
                <p className="text-2xl font-bold text-white">{stats.completedChallenges}</p>
                <p className="text-sm text-gray-400">Completed</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6"
              >
                <Flag className="w-10 h-10 text-yellow-400 mx-auto mb-3" />
                <p className="text-2xl font-bold text-white">{stats.totalFlags}</p>
                <p className="text-sm text-gray-400">Flags Captured</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6"
              >
                <Activity className="w-10 h-10 text-purple-400 mx-auto mb-3" />
                <p className="text-2xl font-bold text-white">{stats.difficulty}</p>
                <p className="text-sm text-gray-400">Level</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Challenges Section */}
      <div className="relative py-20">        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <div className="mb-20">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="text-4xl font-bold text-white mb-8"
              >
                Security Challenges
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="text-gray-400 max-w-3xl mx-auto text-lg leading-relaxed"
              >
                Master web application security through hands-on challenges. Each challenge represents 
                a real-world vulnerability category with practical exercises and detection scenarios.
              </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 justify-items-center">
              {challenges.map((challenge, index) => (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + (index * 0.1) }}
                  className="w-full max-w-md"
                >
                  <ChallengeCard
                    challenge={challenge}
                    userFlags={userFlags}
                    index={index}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>


    </div>
  )
}