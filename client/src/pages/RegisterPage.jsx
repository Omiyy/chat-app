import React, { useState } from 'react'
import { IoClose } from "react-icons/io5";
import { Link, useNavigate } from 'react-router-dom';
import uploadFile from '../helpers/uploadFile';
import axios from 'axios'
import toast from 'react-hot-toast';
import { FaCamera } from 'react-icons/fa';
import { BsSunFill, BsMoonStarsFill } from 'react-icons/bs';
import { useTheme } from '../context/ThemeContext';

const FEATURES = ['Real-time messaging', 'Share photos & videos', "See who's online"];

const RegisterPage = () => {
  const [data, setData] = useState({ name: "", email: "", password: "", profile_pic: "" })
  const [uploadPhoto, setUploadPhoto] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { isDark, toggleTheme } = useTheme()

  const bg      = isDark ? '#0a0a0f' : '#f1f5f9'
  const card    = isDark ? '#111118' : '#ffffff'
  const border  = isDark ? '#2a2a35' : '#e2e8f0'
  const label   = isDark ? '#9994b8' : '#475569'
  const txt     = isDark ? '#f0eeff' : '#1e293b'
  const muted   = isDark ? '#5c587a' : '#94a3b8'
  const inputBg = isDark ? '#0a0a0f' : '#f8fafc'

  const handleOnChange = (e) => {
    const { name, value } = e.target
    setData(prev => ({ ...prev, [name]: value }))
  }

  const handleUploadPhoto = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploadPhoto(file)
    try {
      const uploadResult = await uploadFile(file)
      if (uploadResult?.url) {
        setData(prev => ({ ...prev, profile_pic: uploadResult.url }))
        toast.success('Photo uploaded!')
      } else {
        toast.error('Failed to upload photo')
      }
    } catch (error) {
      toast.error('Error uploading photo')
      setUploadPhoto(null)
    }
  }

  const handleClearUploadPhoto = (e)=>{
    e.stopPropagation()
    e.preventDefault()
    setUploadPhoto(null)
    setData((preve)=>({ ...preve, profile_pic : "" }))
  }

  const handleSubmit = async(e)=>{
    e.preventDefault()
    e.stopPropagation()
    setIsLoading(true)
    const URL = `${import.meta.env.VITE_BACKEND_URL}/api/register`
    try {
        const response = await axios.post(URL,data)
        toast.success(response.data.message)
        if(response.data.success){
            setData({ name:"", email:"", password:"", profile_pic:"" })
            navigate('/email')
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
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: '#fff', letterSpacing: '-0.5px' }}>ChatApp</span>
          </div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 40, fontWeight: 800, color: '#fff', lineHeight: 1.15, letterSpacing: '-1px', marginBottom: 16 }}>
            Connect with<br />everyone,<br />everywhere.
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, lineHeight: 1.6, maxWidth: 280 }}>
            Join millions of people using ChatApp to stay close with friends, family, and colleagues.
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
        <button onClick={toggleTheme}
          style={{ position: 'absolute', top: 20, right: 20, width: 40, height: 40, borderRadius: 12, border: `1px solid ${border}`, background: card, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: isDark ? '#a594f9' : '#7c3aed', transition: 'all 0.2s', zIndex: 10, boxShadow: isDark ? '0 4px 16px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.08)' }}
          title={isDark ? 'Switch to light' : 'Switch to dark'}
        >
          {isDark ? <BsSunFill size={17} /> : <BsMoonStarsFill size={17} />}
        </button>

        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 22, padding: '36px 36px', boxShadow: isDark ? '0 24px 64px rgba(0,0,0,0.5)' : '0 8px 40px rgba(0,0,0,0.08)', transition: 'all 0.3s' }}>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 800, color: txt, letterSpacing: '-0.5px', margin: '0 0 4px' }}>Create account</h2>
              <p style={{ fontSize: 13, color: muted, margin: 0 }}>Fill in your details to get started</p>
            </div>

            {/* Photo upload */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
              <label htmlFor='profile_pic' style={{ cursor: 'pointer', position: 'relative', display: 'inline-block' }}>
                <div style={{ width: 76, height: 76, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: `2px dashed ${data.profile_pic ? '#7c3aed' : border}`, background: inputBg, transition: 'border-color 0.2s' }}>
                  {data.profile_pic ? (
                    <img src={data.profile_pic} alt='avatar' style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: muted }}>
                      <FaCamera size={20} />
                      <span style={{ fontSize: 10, fontWeight: 600 }}>Photo</span>
                    </div>
                  )}
                </div>
                {data.profile_pic && (
                  <button type='button' onClick={handleClearUploadPhoto}
                    style={{ position: 'absolute', top: -2, right: -2, width: 20, height: 20, borderRadius: '50%', background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.25)' }}>
                    <IoClose size={11} />
                  </button>
                )}
                <input type='file' id='profile_pic' style={{ display: 'none' }} onChange={handleUploadPhoto} accept='image/*' />
              </label>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { id: 'name', type: 'text', label: 'Full Name', placeholder: 'John Doe' },
                { id: 'email', type: 'email', label: 'Email', placeholder: 'you@example.com' },
                { id: 'password', type: 'password', label: 'Password', placeholder: 'Min. 8 characters' },
              ].map(({ id, type, label: lbl, placeholder }) => (
                <div key={id} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label htmlFor={id} style={{ fontSize: 13, fontWeight: 600, color: label }}>{lbl}</label>
                  <input
                    type={type} id={id} name={id} placeholder={placeholder}
                    value={data[id]} onChange={handleOnChange} required
                    style={{ width: '100%', background: inputBg, border: `1.5px solid ${border}`, borderRadius: 11, padding: '11px 14px', fontSize: 14, color: txt, outline: 'none', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                    onFocus={e => e.target.style.borderColor = '#7c3aed'}
                    onBlur={e => e.target.style.borderColor = border}
                  />
                </div>
              ))}

              <button type='submit' disabled={isLoading}
                style={{ width: '100%', padding: 13, borderRadius: 12, background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: '#fff', fontSize: 14, fontFamily: 'Syne, sans-serif', fontWeight: 700, border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1, boxShadow: '0 4px 20px rgba(124,58,237,0.35)', marginTop: 4, transition: 'opacity 0.2s' }}>
                {isLoading ? 'Creating account...' : 'Create Account →'}
              </button>
            </form>

            <p style={{ marginTop: 22, textAlign: 'center', fontSize: 13, color: muted }}>
              Already have an account?{' '}
              <Link to='/email' style={{ color: '#7c3aed', fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
