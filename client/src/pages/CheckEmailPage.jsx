import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import axios from 'axios'
import toast from 'react-hot-toast';
import { MdEmail } from 'react-icons/md';
import AuthCard from '../components/AuthCard';

const CheckEmailPage = () => {
  const [data, setData] = useState({ email: "" })
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleOnChange = (e) => {
    const { name, value } = e.target
    setData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsLoading(true)
    const URL = `${import.meta.env.VITE_BACKEND_URL}/api/email`
    try {
      const response = await axios.post(URL, data)
      toast.success(response.data.message)
      if (response.data.success) {
        setData({ email: "" })
        navigate('/password', { state: response?.data?.data })
      }
    } catch (error) {
      toast.error(error?.response?.data?.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthCard
      heroTitle={<>Welcome<br />back!</>}
      heroSubtitle="Sign in to pick up right where you left off. Your conversations are waiting."
      heroFeatures={['Instant delivery', 'Always in sync', 'Works everywhere']}
    >
      {/* Icon */}
      <div
        className='w-12 h-12 rounded-xl flex items-center justify-center mb-6'
        style={{ background: 'var(--color-accent-soft)' }}
      >
        <MdEmail size={24} style={{ color: 'var(--color-accent)' }} />
      </div>

      <h2 className='text-2xl font-bold mb-1.5' style={{ color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
        Sign in
      </h2>
      <p className='text-sm mb-7' style={{ color: 'var(--text-tertiary)' }}>
        Enter your email address to continue
      </p>

      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <div className='flex flex-col gap-1.5'>
          <label htmlFor='email' className='text-[13px] font-medium' style={{ color: 'var(--text-secondary)' }}>
            Email address
          </label>
          <input
            type='email'
            name='email'
            id='email'
            placeholder='you@example.com'
            value={data.email}
            onChange={handleOnChange}
            required
            autoFocus
            className='input-field'
          />
        </div>

        <button
          type='submit'
          disabled={isLoading}
          className='btn-primary w-full py-3 mt-1 text-[14px] font-semibold'
          style={{ borderRadius: 10 }}
        >
          {isLoading ? 'Checking...' : 'Continue →'}
        </button>
      </form>

      <p className='text-center text-[13px] mt-6' style={{ color: 'var(--text-tertiary)' }}>
        New to ChatApp?{' '}
        <a href='/register' className='font-semibold' style={{ color: 'var(--color-accent)' }}>
          Create account
        </a>
      </p>
    </AuthCard>
  )
}

export default CheckEmailPage
