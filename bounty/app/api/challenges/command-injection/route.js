import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import dbManager from '../../../../../lib/database.js'
import { CHALLENGE_CONFIG } from '../../../../../lib/config.js'

const execAsync = promisify(exec)

// VULNERABLE: Command Injection challenge for educational purposes
// WARNING: This is heavily sandboxed and restricted for safety
export async function POST(request) {
  try {
    await dbManager.connect()
    
    const { command, filename } = await request.json()
    
    if (!command) {
      return NextResponse.json(
        { success: false, message: 'Command parameter required' },
        { status: 400 }
      )
    }

    // Log the attempt
    await dbManager.createLog({
      type: 'command_injection_attempt',
      command,
      filename,
      timestamp: new Date()
    })

    let response = {
      success: false,
      message: 'Command execution failed',
      command: command
    }

    const flags = []

    try {
      // VULNERABLE: Direct command injection (but heavily sandboxed)
      const result = await executeSandboxedCommand(command, filename)
      
      response.success = true
      response.output = result.output
      response.message = 'Command executed successfully'

      // Check for command injection patterns and award flags
      const injectionPatterns = [
        /[;&|`$()]/,  // Command separators
        /\|\s*\w+/,   // Piping
        /&&|\|\|/,    // Logical operators
        /`.*`/,       // Command substitution
        /\$\(/        // Command substitution
      ]

      const hasInjection = injectionPatterns.some(pattern => pattern.test(command))
      
      if (hasInjection) {
        // Basic command injection flag
        flags.push({
          challengeId: 'command-injection',
          subtaskId: 'cmd-basic',
          flag: CHALLENGE_CONFIG['command-injection'].flags['cmd-basic'],
          description: 'Basic command injection successful'
        })

        // Check for filter bypass attempts
        if (command.includes('cat') || command.includes('ls') || 
            command.includes('pwd') || command.includes('whoami')) {
          flags.push({
            challengeId: 'command-injection',
            subtaskId: 'cmd-bypass',
            flag: CHALLENGE_CONFIG['command-injection'].flags['cmd-bypass'],
            description: 'Command filter bypass achieved'
          })
        }

        // Check for advanced system access
        if (command.includes('env') || command.includes('ps') ||
            command.includes('/etc/') || command.includes('id')) {
          flags.push({
            challengeId: 'command-injection',
            subtaskId: 'cmd-escalate',
            flag: CHALLENGE_CONFIG['command-injection'].flags['cmd-escalate'],
            description: 'System information accessed'
          })
        }
      }

    } catch (error) {
      response.error = error.message
      response.message = 'Command execution failed with error'
    }

    if (flags.length > 0) {
      response.flags = flags
      response.injectionDetected = true
      
      await dbManager.createLog({
        type: 'flag_captured',
        challengeId: 'command-injection',
        flags: flags.map(f => f.subtaskId),
        command: command.substring(0, 100),
        timestamp: new Date()
      })
    }

    return NextResponse.json(response)
    
  } catch (error) {
    console.error('Command injection challenge error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get challenge info
export async function GET(request) {
  try {
    return NextResponse.json({
      success: true,
      challenge: CHALLENGE_CONFIG['command-injection'],
      availableCommands: [
        'ping localhost',
        'echo "Hello World"',
        'date',
        'help'
      ],
      hints: [
        'Try using command separators like ; or &&',
        'Look for ways to execute multiple commands',
        'Consider using command substitution with backticks'
      ],
      warning: 'This endpoint simulates command execution in a restricted environment'
    })
    
  } catch (error) {
    console.error('Command injection info error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to get challenge info' },
      { status: 500 }
    )
  }
}

// SANDBOXED command execution for safety
// WARNING: This is heavily restricted and simulated for educational purposes
async function executeSandboxedCommand(userInput, filename = '') {
  // SECURITY: Heavy sandboxing and simulation for safety
  
  // Whitelist only specific safe commands for demonstration
  const safeCommands = {
    'ping localhost': 'PING localhost (127.0.0.1): 56 data bytes\n64 bytes from 127.0.0.1: icmp_seq=0 ttl=64 time=0.045 ms',
    'echo "Hello World"': 'Hello World',
    'date': new Date().toString(),
    'help': 'Available commands: ping localhost, echo, date, help',
    'whoami': 'ctf-user',
    'pwd': '/home/ctf-user',
    'ls': 'file1.txt  file2.txt  secret.txt',
    'cat secret.txt': 'CTF{c0mm4nd_1nj3ct10n_f0und}',
    'id': 'uid=1000(ctf-user) gid=1000(ctf-user) groups=1000(ctf-user)',
    'env': 'PATH=/usr/bin:/bin\nHOME=/home/ctf-user\nUSER=ctf-user'
  }

  // Check if it's a direct safe command
  if (safeCommands[userInput]) {
    return { output: safeCommands[userInput] }
  }

  // Simulate command injection patterns
  if (userInput.includes(';')) {
    const commands = userInput.split(';')
    let output = ''
    
    for (const cmd of commands) {
      const trimmedCmd = cmd.trim()
      if (safeCommands[trimmedCmd]) {
        output += safeCommands[trimmedCmd] + '\n'
      } else {
        output += `bash: ${trimmedCmd}: command not found\n`
      }
    }
    
    return { output }
  }

  if (userInput.includes('&&')) {
    const commands = userInput.split('&&')
    let output = ''
    
    for (const cmd of commands) {
      const trimmedCmd = cmd.trim()
      if (safeCommands[trimmedCmd]) {
        output += safeCommands[trimmedCmd] + '\n'
      } else {
        output += `bash: ${trimmedCmd}: command not found\n`
        break // && stops on first failure
      }
    }
    
    return { output }
  }

  if (userInput.includes('|')) {
    return { output: 'Pipe operation simulated: command output would be processed' }
  }

  if (userInput.includes('`') || userInput.includes('$(')) {
    return { output: 'Command substitution detected and executed' }
  }

  // Default response for unknown commands
  return { output: `bash: ${userInput}: command not found` }
}