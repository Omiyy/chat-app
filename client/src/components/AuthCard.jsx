import React from 'react'
import { BsSunFill, BsMoonStarsFill } from 'react-icons/bs'
import { useTheme } from '../context/ThemeContext'
import AuthHero from './AuthHero'

const AuthCard = ({ children, heroTitle, heroSubtitle, heroFeatures }) => {
  const { isDark, toggleTheme } = useTheme()

  return (
    <div className='min-h-screen flex' style={{ background: 'var(--bg-primary)', transition: 'background 0.3s' }}>
      {/* Left hero panel */}
      <AuthHero title={heroTitle} subtitle={heroSubtitle} features={heroFeatures} />

      {/* Right panel */}
      <div className='flex-1 flex items-center justify-center p-6 relative'>
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className='btn-icon absolute top-5 right-5 z-10'
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            border: '1px solid var(--border-primary)',
            background: 'var(--bg-surface)',
            color: 'var(--text-accent)',
          }}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <BsSunFill size={17} /> : <BsMoonStarsFill size={17} />}
        </button>

        <div className='w-full max-w-[420px]'>
          <div
            className='card p-9 sm:p-10'
            style={{ borderRadius: 20 }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default React.memo(AuthCard)
