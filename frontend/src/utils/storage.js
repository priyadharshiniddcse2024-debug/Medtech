export const STORAGE_KEYS = {
  token: 'token',
  user: 'user'
}

export const readJSON = (key) => {
  const raw = localStorage.getItem(key)
  if (!raw) return null

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export const writeJSON = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value))
}

export const readValue = (key) => localStorage.getItem(key)

export const writeValue = (key, value) => {
  localStorage.setItem(key, value)
}

export const removeValues = (...keys) => {
  keys.forEach((key) => localStorage.removeItem(key))
}
