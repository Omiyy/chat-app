import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaAngleLeft } from 'react-icons/fa6'
import { MdEmail } from 'react-icons/md'
import AuthCard from '../components/AuthCard'

const Forgotpassword = () => {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    // Backend endpoint for password reset would go here
    setSubmitted(true)
  }

  return (
    <AuthCard
      heroTitle={<>Reset your<br />password</>}
      heroSubtitle="Don't worry — we'll help you get back into your account."
      heroFeatures={['Secure reset link', 'Quick recovery', 'Account protection']}
    >
      {/* Icon */}
      <div
        className='w-12 h-12 rounded-xl flex items-center justify-center mb-6'
        style={{ background: 'var(--color-accent-soft)' }}
      >
        <MdEmail size={24} style={{ color: 'var(--color-accent)' }} />
      </div>

      {!submitted ? (
        <>
          <h2 className='text-2xl font-bold mb-1.5' style={{ color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
            Forgot password?
          </h2>
          <p className='text-sm mb-7' style={{ color: 'var(--text-tertiary)' }}>
            Enter your email and we'll send you a reset link
          </p>

          <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
            <div className='flex flex-col gap-1.5'>
              <label htmlFor='reset-email' className='text-[13px] font-medium' style={{ color: 'var(--text-secondary)' }}>
                Email address
              </label>
              <input
                type='email'
                id='reset-email'
                placeholder='you@example.com'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                className='input-field'
              />
            </div>

            <button
              type='submit'
              className='btn-primary w-full py-3 mt-1 text-[14px] font-semibold'
              style={{ borderRadius: 10 }}
            >
              Send Reset Link →
            </button>
          </form>
        </>
      ) : (
        <div className='text-center py-4'>
          <div
            className='w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4'
            style={{ background: 'var(--color-accent-soft)' }}
          >
            <MdEmail size={28} style={{ color: 'var(--color-accent)' }} />
          </div>
          <h2 className='text-xl font-bold mb-2' style={{ color: 'var(--text-primary)' }}>
            Check your email
          </h2>
          <p className='text-sm leading-relaxed mb-6' style={{ color: 'var(--text-tertiary)' }}>
            If an account exists for <strong style={{ color: 'var(--text-secondary)' }}>{email}</strong>, we'll send a password reset link shortly.
          </p>
        </div>
      )}

      <div className='mt-6'>
        <Link
          to='/email'
          className='flex items-center justify-center gap-1.5 text-[13px] font-medium'
          style={{ color: 'var(--text-tertiary)' }}
        >
          <FaAngleLeft size={11} />
          Back to sign in
        </Link>
      </div>
    </AuthCard>
  )
}

export default Forgotpassword