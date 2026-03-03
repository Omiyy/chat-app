import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios'
import toast from 'react-hot-toast';
import Avatar from '../components/Avatar';
import { useDispatch } from 'react-redux';
import { setToken } from '../redux/userSlice';
import { FaLock } from 'react-icons/fa';
import { FaAngleLeft } from 'react-icons/fa6';
import { BsSunFill, BsMoonStarsFill } from 'react-icons/bs';
import { useTheme } from '../context/ThemeContext';

const FEATURES = ['End-to-end security', 'Private conversations', 'Your data, protected'];

const CheckPasswordPage = () => {
  const [data, setData] = useState({ password: "", userId: "" })
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { isDark, toggleTheme } = useTheme()

  const bg      = isDark ? '#0a0a0f' : '#f1f5f9'
  const card    = isDark ? '#111118' : '#ffffff'
  const border  = isDark ? '#2a2a35' : '#e2e8f0'
  const label   = isDark ? '#9994b8' : '#475569'
  const txt     = isDark ? '#f0eeff' : '#1e293b'
  const muted   = isDark ? '#5c587a' : '#94a3b8'
  const inputBg = isDark ? '#0a0a0f' : '#f8fafc'

  useEffect(() => {
    if (!location?.state?.name) { navigate('/email') }
  }, [])

  const handleOnChange = (e) => {
    const { name, value } = e.target
    setData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsLoading(true)
    const URL = `${import.meta.env.VITE_BACKEND_URL}/api/password`
    try {
      const response = await axios({
        method: 'post', url: URL,
        data: { userId: location?.state?._id, password: data.password },
        withCredentials: true,
      })
      toast.success(response.data.message)
      if (response.data.success) {
        dispatch(setToken(response?.data?.token))
        localStorage.setItem('token', response?.data?.token)
        setData({ password: "" })
        navigate('/home')
      }
    } catch (error) {
      toast.error(error?.response?.data?.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: bg, transition: 'background 0.3s' }}>

      {/* Left hero */}
      <div style={{ display: 'none', width: '42%', background: 'linear-gradient(135deg, #5b21b6 0%, #7c3aed 50%, #4f46e5 100%)', flexDirection: 'column', justifyContent: 'space-between', padding: '44px 48px', position: 'relative', overflow: 'hidden' }}
        className='lg:flex'>
        <div style={{ position: 'absolute', top: -64, left: -64, width: 256, height: 256, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', top: '35%', right: -80, width: 288, height: 288, borderRadius: '50%', background: 'rgba(167,139,250,0.2)' }} />
        <div style={{ position: 'absolute', bottom: -48, left: '30%', width: 192, height: 192, borderRadius: '50%', background: 'rgba(196,181,253,0.15)' }} />

        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 52 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: '#fff', letterSpacing: '-0.5px' }}>cipher</span>
          </div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 40, fontWeight: 800, color: '#fff', lineHeight: 1.15, letterSpacing: '-1px', marginBottom: 16 }}>
            Almost<br />there!
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, lineHeight: 1.6, maxWidth: 280 }}>
            Just one more step. Enter your password to access your account.
          </p>
        </div>

        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {FEATURES.map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />
              </div>
              <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14 }}>{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative' }}>
        {/* Theme toggle */}
        <button onClick={toggleTheme}
          style={{ position: 'absolute', top: 20, right: 20, width: 40, height: 40, borderRadius: 12, border: `1px solid ${border}`, background: card, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: isDark ? '#a594f9' : '#7c3aed', transition: 'all 0.2s', zIndex: 10 }}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <BsSunFill size={17} /> : <BsMoonStarsFill size={17} />}
        </button>

        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 22, padding: '40px 36px', boxShadow: isDark ? '0 24px 64px rgba(0,0,0,0.5)' : '0 8px 40px rgba(0,0,0,0.08)', transition: 'all 0.3s' }}>

            {/* User info */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28 }}>
              <Avatar width={72} height={72} name={location?.state?.name} imageUrl={location?.state?.profile_pic} />
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 17, color: txt, margin: '12px 0 2px', letterSpacing: '-0.3px' }}>{location?.state?.name}</h3>
              <p style={{ fontSize: 13, color: muted, margin: 0 }}>{location?.state?.email}</p>
            </div>

            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, color: txt, letterSpacing: '-0.5px', margin: '0 0 4px' }}>Enter your password</h2>
              <p style={{ fontSize: 13, color: muted, margin: 0 }}>Keep your account secure</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: label }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type='password' name='password' placeholder='Enter your password'
                    value={data.password} onChange={handleOnChange} required autoFocus
                    style={{ width: '100%', background: inputBg, border: `1.5px solid ${border}`, borderRadius: 11, padding: '11px 14px 11px 40px', fontSize: 14, color: txt, outline: 'none', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                    onFocus={e => e.target.style.borderColor = '#7c3aed'}
                    onBlur={e => e.target.style.borderColor = border}
                  />
                  <FaLock size={13} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: muted, pointerEvents: 'none' }} />
                </div>
              </div>

              <button type='submit' disabled={isLoading}
                style={{ width: '100%', padding: 13, borderRadius: 12, background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: '#fff', fontSize: 14, fontFamily: 'Syne, sans-serif', fontWeight: 700, border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1, boxShadow: '0 4px 20px rgba(124,58,237,0.35)', marginTop: 4, transition: 'opacity 0.2s' }}
              >
                {isLoading ? 'Signing in...' : 'Sign In →'}
              </button>
            </form>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
              <button onClick={() => navigate('/email')}
                style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: muted, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'DM Sans, sans-serif' }}
                onMouseEnter={e => e.currentTarget.style.color = '#7c3aed'}
                onMouseLeave={e => e.currentTarget.style.color = muted}
              >
                <FaAngleLeft size={12} /> Back
              </button>
              <Link to='/forgot-password' style={{ fontSize: 13, color: '#7c3aed', fontWeight: 600, textDecoration: 'none' }}>
                Forgot password?
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckPasswordPage
