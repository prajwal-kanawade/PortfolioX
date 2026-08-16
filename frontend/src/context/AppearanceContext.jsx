import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { AuthContext } from './AuthContext'
import { settingsAPI } from '../services/api'

export const AppearanceContext = createContext()

const ACCENT_OPTIONS = ['indigo', 'teal', 'rose', 'amber']
const FONT_SIZE_OPTIONS = ['small', 'medium', 'large']

function getInitial(key, options, fallback) {
  const stored = localStorage.getItem(key)
  return options.includes(stored) ? stored : fallback
}

export const AppearanceProvider = ({ children }) => {
  const auth = useContext(AuthContext)
  const isAuthenticated = !!auth?.user
  const [accentColor, setAccentColorState] = useState(() => getInitial('accentColor', ACCENT_OPTIONS, 'indigo'))
  const [fontSize, setFontSizeState] = useState(() => getInitial('fontSize', FONT_SIZE_OPTIONS, 'medium'))

  useEffect(() => {
    document.documentElement.setAttribute('data-accent', accentColor)
    localStorage.setItem('accentColor', accentColor)
  }, [accentColor])

  useEffect(() => {
    document.documentElement.setAttribute('data-font-size', fontSize)
    localStorage.setItem('fontSize', fontSize)
  }, [fontSize])

  // Pull the user's saved preference on login so it follows them across devices.
  useEffect(() => {
    if (!isAuthenticated) return
    settingsAPI.get()
      .then((res) => {
        if (ACCENT_OPTIONS.includes(res.data.accentColor)) setAccentColorState(res.data.accentColor)
        if (FONT_SIZE_OPTIONS.includes(res.data.fontSize)) setFontSizeState(res.data.fontSize)
      })
      .catch(() => {})
  }, [isAuthenticated])

  const setAccentColor = useCallback((color) => setAccentColorState(color), [])
  const setFontSize = useCallback((size) => setFontSizeState(size), [])

  const value = { accentColor, fontSize, setAccentColor, setFontSize, ACCENT_OPTIONS, FONT_SIZE_OPTIONS }

  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>
}

export const useAppearance = () => {
  const context = React.useContext(AppearanceContext)
  if (!context) {
    throw new Error('useAppearance must be used within AppearanceProvider')
  }
  return context
}
