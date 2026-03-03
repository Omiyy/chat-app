import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('cipher-theme')
    return saved ? saved === 'dark' : true // default: dark
  })

  useEffect(() => {
    localStorage.setItem('cipher-theme', isDark ? 'dark' : 'light')
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
  }, [isDark])

  const toggleTheme = () => setIsDark(p => !p)

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)

// Theme value helper — call t(darkVal, lightVal)
export const useT = () => {
  const { isDark } = useTheme()
  return (darkVal, lightVal) => isDark ? darkVal : lightVal
}
