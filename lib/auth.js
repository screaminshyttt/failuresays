import jwt from 'jsonwebtoken'

function getSecret() {
  return process.env.JWT_SECRET || 'dev-secret'
}

export function signToken(payload) {
  return jwt.sign(payload, getSecret(), { expiresIn: '30d' })
}

export function verifyToken(token) {
  try { return jwt.verify(token, getSecret()) } catch { return null }
}

export function isAuthed(request) {
  const auth = request.headers.get('authorization') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) return null
  return verifyToken(token)
}
