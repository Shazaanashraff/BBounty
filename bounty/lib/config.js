// Challenge configuration and constants
export const CHALLENGE_TYPES = {
  SQL_INJECTION: 'sql-injection',
  BROKEN_ACCESS_CONTROL: 'broken-access-control', 
  CRYPTOGRAPHIC_FAILURES: 'cryptographic-failures',
  IDOR: 'idor',
  STORED_XSS: 'stored-xss',
  COMMAND_INJECTION: 'command-injection'
}

export const DIFFICULTY_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate', 
  ADVANCED: 'advanced'
}

export const CHALLENGE_CONFIG = {
  [CHALLENGE_TYPES.SQL_INJECTION]: {
    id: CHALLENGE_TYPES.SQL_INJECTION,
    title: 'SQL Injection',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    description: 'Exploit vulnerable database queries to bypass authentication and extract sensitive information.',
    hint: 'Look for login forms that might not properly sanitize input parameters.',
    subtasks: [
      { id: 'sqli-basic', title: 'Bypass Login', description: 'Access the system without valid credentials' },
      { id: 'sqli-extract', title: 'Data Extraction', description: 'Retrieve sensitive user information' },
      { id: 'sqli-admin', title: 'Admin Access', description: 'Escalate to administrative privileges' }
    ],
    flags: {
      'sqli-basic': 'CTF{sql_1nj3ct10n_b4s1c_byp455}',
      'sqli-extract': 'CTF{d4t4_3xtr4ct10n_5ucc355}',
      'sqli-admin': 'CTF{4dm1n_pr1v1l3g3_35c4l4t10n}'
    }
  },
  [CHALLENGE_TYPES.BROKEN_ACCESS_CONTROL]: {
    id: CHALLENGE_TYPES.BROKEN_ACCESS_CONTROL,
    title: 'Broken Access Control',
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    description: 'Find and exploit flawed authorization mechanisms to access restricted resources.',
    hint: 'Check for endpoints that rely on client-side validation or predictable access patterns.',
    subtasks: [
      { id: 'bac-enum', title: 'Endpoint Discovery', description: 'Find hidden administrative endpoints' },
      { id: 'bac-bypass', title: 'Authorization Bypass', description: 'Access protected resources without proper authorization' },
      { id: 'bac-escalate', title: 'Privilege Escalation', description: 'Gain administrative access through flawed controls' }
    ],
    flags: {
      'bac-enum': 'CTF{h1dd3n_3ndp01nt_d15c0v3ry}',
      'bac-bypass': 'CTF{4uth0r1z4t10n_byp455_5ucc355}',
      'bac-escalate': 'CTF{pr1v1l3g3_35c4l4t10n_c0mpl3t3}'
    }
  },
  [CHALLENGE_TYPES.CRYPTOGRAPHIC_FAILURES]: {
    id: CHALLENGE_TYPES.CRYPTOGRAPHIC_FAILURES,
    title: 'Cryptographic Failures',
    difficulty: DIFFICULTY_LEVELS.ADVANCED,
    description: 'Identify and exploit weak cryptographic implementations to recover sensitive data.',
    hint: 'Look for tokens, passwords, or secrets that might be stored or transmitted insecurely.',
    subtasks: [
      { id: 'crypto-weak', title: 'Weak Hashing', description: 'Exploit weak password hashing mechanisms' },
      { id: 'crypto-storage', title: 'Insecure Storage', description: 'Find sensitive data stored in plaintext' },
      { id: 'crypto-token', title: 'Token Manipulation', description: 'Manipulate or forge authentication tokens' }
    ],
    flags: {
      'crypto-weak': 'CTF{w34k_h45h1ng_3xpl01t3d}',
      'crypto-storage': 'CTF{1n53cur3_5t0r4g3_f0und}',
      'crypto-token': 'CTF{t0k3n_m4n1pul4t10n_5ucc355}'
    }
  },
  [CHALLENGE_TYPES.IDOR]: {
    id: CHALLENGE_TYPES.IDOR,
    title: 'Insecure Direct Object References',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    description: 'Access other users\' data through predictable object references.',
    hint: 'Look for numeric IDs or predictable patterns in URLs and API endpoints.',
    subtasks: [
      { id: 'idor-enum', title: 'Object Enumeration', description: 'Discover accessible object IDs' },
      { id: 'idor-access', title: 'Unauthorized Access', description: 'Access another user\'s private data' },
      { id: 'idor-modify', title: 'Data Modification', description: 'Modify resources belonging to other users' }
    ],
    flags: {
      'idor-enum': 'CTF{0bj3ct_3num3r4t10n_5ucc355}',
      'idor-access': 'CTF{un4uth0r1z3d_d4t4_4cc355}',
      'idor-modify': 'CTF{d4t4_m0d1f1c4t10n_4ch13v3d}'
    }
  },
  [CHALLENGE_TYPES.STORED_XSS]: {
    id: CHALLENGE_TYPES.STORED_XSS,
    title: 'Stored Cross-Site Scripting',
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    description: 'Inject malicious scripts that execute in other users\' browsers.',
    hint: 'Find input fields that store user content and don\'t properly sanitize HTML.',
    subtasks: [
      { id: 'xss-basic', title: 'Basic XSS', description: 'Execute JavaScript in the browser' },
      { id: 'xss-persist', title: 'Persistent Storage', description: 'Store malicious payload that affects other users' },
      { id: 'xss-admin', title: 'Admin Session Hijack', description: 'Compromise an administrative session' }
    ],
    flags: {
      'xss-basic': 'CTF{b451c_x55_3x3cut10n}',
      'xss-persist': 'CTF{p3r515t3nt_x55_5t0r3d}',
      'xss-admin': 'CTF{4dm1n_5355_h1j4ck3d}'
    }
  },
  [CHALLENGE_TYPES.COMMAND_INJECTION]: {
    id: CHALLENGE_TYPES.COMMAND_INJECTION,
    title: 'Command Injection',
    difficulty: DIFFICULTY_LEVELS.ADVANCED,
    description: 'Execute system commands through vulnerable input validation.',
    hint: 'Look for functionality that processes user input and might execute system commands.',
    subtasks: [
      { id: 'cmd-basic', title: 'Basic Injection', description: 'Execute a simple command' },
      { id: 'cmd-bypass', title: 'Filter Bypass', description: 'Bypass input validation filters' },
      { id: 'cmd-escalate', title: 'System Access', description: 'Gain deeper system access' }
    ],
    flags: {
      'cmd-basic': 'CTF{c0mm4nd_1nj3ct10n_b451c}',
      'cmd-bypass': 'CTF{f1lt3r_byp455_5ucc355}',
      'cmd-escalate': 'CTF{5y5t3m_4cc355_4ch13v3d}'
    }
  }
}

export const APP_CONFIG = {
  JWT_SECRET: process.env.JWT_SECRET || 'insecure-jwt-secret-for-demo',
  ADMIN_USER: process.env.ADMIN_USER || 'admin',
  ADMIN_PASS: process.env.ADMIN_PASS || 'admin123',
  MONGODB_URI: process.env.MONGODB_URI,
  COOKIE_NAME: 'ctf-session',
  MAX_LOGIN_ATTEMPTS: 5,
  SESSION_TIMEOUT: 3600000, // 1 hour
}

export const LOG_TYPES = {
  CHALLENGE_ATTEMPT: 'challenge_attempt',
  LOGIN_ATTEMPT: 'login_attempt',
  ADMIN_ACTION: 'admin_action',
  FLAG_CAPTURED: 'flag_captured'
}