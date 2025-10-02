'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Terminal, Play, AlertTriangle } from 'lucide-react'

export default function CommandInjectionChallenge({ onFlagCapture }) {
  const [command, setCommand] = useState('')
  const [output, setOutput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const simulateCommand = (cmd) => {
    // Simulate command execution with vulnerabilities
    setIsLoading(true)
    
    setTimeout(() => {
      let result = ''
      
      // Check for command injection attempts
      if (cmd.includes(';') || cmd.includes('&&') || cmd.includes('||') || cmd.includes('|')) {
        if (cmd.toLowerCase().includes('cat') && (cmd.includes('flag') || cmd.includes('secret'))) {
          result = `$ ${cmd}\nExecuting: ${cmd}\nCTF{c0mm4nd_1nj3ct10n}\nCommand injection successful!`
          setTimeout(() => onFlagCapture(), 1500)
        } else if (cmd.includes('ls') || cmd.includes('dir')) {
          result = `$ ${cmd}\nExecuting: ${cmd}\nflag.txt\nconfig.php\nindex.html\nSecrets exposed through command injection!`
        } else if (cmd.includes('whoami') || cmd.includes('id')) {
          result = `$ ${cmd}\nExecuting: ${cmd}\nroot\nuid=0(root) gid=0(root) groups=0(root)\nElevated privileges detected!`
        } else {
          result = `$ ${cmd}\nExecuting: ${cmd}\nCommand injection detected but no useful output.`
        }
      } else {
        // Simulate normal ping functionality
        if (cmd.startsWith('ping ') || cmd.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)) {
          const target = cmd.replace('ping ', '') || cmd
          result = `$ ping ${target}\nPING ${target} (${target}): 56 data bytes\n64 bytes from ${target}: icmp_seq=0 ttl=64 time=1.234 ms\n64 bytes from ${target}: icmp_seq=1 ttl=64 time=1.456 ms\n64 bytes from ${target}: icmp_seq=2 ttl=64 time=1.123 ms\n\n--- ${target} ping statistics ---\n3 packets transmitted, 3 received, 0% packet loss`
        } else {
          result = `$ ping ${cmd}\nping: cannot resolve ${cmd}: Unknown host`
        }
      }
      
      setOutput(result)
      setIsLoading(false)
    }, 1000)
  }

  const handleExecute = (e) => {
    e.preventDefault()
    if (!command.trim()) return
    simulateCommand(command)
  }

  const tryPayload = (payload) => {
    setCommand(payload)
    simulateCommand(payload)
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Challenge Info */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">🎯 Your Mission</h2>
          <div className="space-y-4 text-gray-300">
            <p>
              This network utility allows you to ping hosts but has a command injection 
              vulnerability. Exploit it to execute arbitrary system commands.
            </p>
            
            <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
              <h3 className="text-blue-400 font-semibold mb-2">💡 Hints:</h3>
              <ul className="space-y-2 text-sm">
                <li>• Try using command separators: <code className="bg-gray-700 px-1 rounded">;</code> <code className="bg-gray-700 px-1 rounded">&&</code> <code className="bg-gray-700 px-1 rounded">||</code></li>
                <li>• Use commands like <code className="bg-gray-700 px-1 rounded">cat</code>, <code className="bg-gray-700 px-1 rounded">ls</code>, or <code className="bg-gray-700 px-1 rounded">whoami</code></li>
                <li>• Look for files containing "flag" or "secret"</li>
                <li>• Try chaining commands after a valid IP</li>
              </ul>
            </div>

            <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
              <h3 className="text-yellow-400 font-semibold mb-2">⚠️ Example Payloads:</h3>
              <div className="space-y-2 text-sm">
                <button
                  onClick={() => tryPayload('8.8.8.8; ls')}
                  className="block w-full text-left bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-xs font-mono transition-colors"
                >
                  8.8.8.8; ls
                </button>
                <button
                  onClick={() => tryPayload('127.0.0.1 && whoami')}
                  className="block w-full text-left bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-xs font-mono transition-colors"
                >
                  127.0.0.1 && whoami
                </button>
                <button
                  onClick={() => tryPayload('localhost; cat flag.txt')}
                  className="block w-full text-left bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-xs font-mono transition-colors"
                >
                  localhost; cat flag.txt
                </button>
              </div>
            </div>

            <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-4">
              <h3 className="text-red-400 font-semibold mb-2">🚨 Security Impact:</h3>
              <p className="text-sm">
                Command injection can lead to complete system compromise, data theft, 
                and unauthorized access to sensitive resources.
              </p>
            </div>
          </div>
        </div>

        {/* Vulnerable Ping Utility */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <Terminal className="w-6 h-6 text-primary-400" />
            <h2 className="text-xl font-bold text-white">Network Ping Utility</h2>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-3">
              <p className="text-blue-300 text-sm">
                📡 Enter an IP address or hostname to ping
              </p>
            </div>

            <form onSubmit={handleExecute} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Target Host:
                </label>
                <input
                  type="text"
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary-500 font-mono"
                  placeholder="8.8.8.8 or google.com"
                  disabled={isLoading}
                />
              </div>
              
              <button
                type="submit"
                disabled={isLoading || !command.trim()}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Executing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Execute Ping
                  </>
                )}
              </button>
            </form>

            {/* Terminal Output */}
            {output && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-black border border-gray-600 rounded-lg p-4 min-h-32 max-h-64 overflow-y-auto"
              >
                <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">
                  {output}
                </pre>
              </motion.div>
            )}

            {/* Vulnerability Warning */}
            <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 text-sm font-medium">
                  Warning: Input validation disabled for demonstration purposes!
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}