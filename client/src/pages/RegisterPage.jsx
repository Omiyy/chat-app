import React, { useState } from 'react'
import { IoClose } from "react-icons/io5";
import { Link, useNavigate } from 'react-router-dom';
import uploadFile from '../helpers/uploadFile';
import axios from 'axios'
import toast from 'react-hot-toast';
import { FaCamera } from 'react-icons/fa';
import AuthCard from '../components/AuthCard';

const RegisterPage = () => {
  const [data, setData] = useState({ name: "", email: "", password: "", profile_pic: "" })
  const [uploadPhoto, setUploadPhoto] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showOTP, setShowOTP] = useState(false)
  const [otp, setOtp] = useState("")
  const navigate = useNavigate()

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
      toast.error(error.message || 'Error uploading photo')
      setUploadPhoto(null)
    }
  }

  const handleClearUploadPhoto = (e) => {
    e.stopPropagation()
    e.preventDefault()
    setUploadPhoto(null)
    setData((preve) => ({ ...preve, profile_pic: "" }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsLoading(true)
    const URL = `${import.meta.env.VITE_BACKEND_URL}/api/register`
    try {
      const response = await axios.post(URL, data)
      toast.success(response.data.message)
      if (response.data.success) {
        setShowOTP(true)
      }
    } catch (error) {
      toast.error(error?.response?.data?.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsLoading(true)
    const URL = `${import.meta.env.VITE_BACKEND_URL}/api/verify-otp`
    try {
      const response = await axios.post(URL, { email: data.email, otp })
      toast.success(response.data.message)
      if (response.data.success) {
        navigate('/email')
      }
    } catch (error) {
      toast.error(error?.response?.data?.message)
    } finally {
      setIsLoading(false)
    }
  }

  const FIELDS = [
    { id: 'name', type: 'text', label: 'Full Name', placeholder: 'John Doe' },
    { id: 'email', type: 'email', label: 'Email', placeholder: 'you@example.com' },
    { id: 'password', type: 'password', label: 'Password', placeholder: 'Min. 8 characters' },
  ]

  return (
    <AuthCard
      heroTitle={<>Connect with<br />everyone,<br />everywhere.</>}
      heroSubtitle="Join millions of people using ChatApp to stay close with friends, family, and colleagues."
      heroFeatures={['Real-time messaging', 'Share photos & videos', "See who's online"]}
    >
      <div className='mb-6'>
        <h2 className='text-2xl font-bold mb-1' style={{ color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
          {showOTP ? 'Verify your email' : 'Create account'}
        </h2>
        <p className='text-[13px]' style={{ color: 'var(--text-tertiary)' }}>
          {showOTP ? 'Enter the 6-digit code sent to your email' : 'Fill in your details to get started'}
        </p>
      </div>

      {!showOTP ? (
        <>
          {/* Photo upload */}
          <div className='flex justify-center mb-6'>
            <label htmlFor='profile_pic' className='cursor-pointer relative inline-block'>
              <div
                className='w-[72px] h-[72px] rounded-full flex items-center justify-center overflow-hidden transition-colors duration-200'
                style={{
                  border: `2px dashed ${data.profile_pic ? 'var(--color-accent)' : 'var(--border-primary)'}`,
                  background: 'var(--input-bg)',
                }}
              >
                {data.profile_pic ? (
                  <img src={data.profile_pic} alt='avatar' className='w-full h-full object-cover' />
                ) : (
                  <div className='flex flex-col items-center gap-1' style={{ color: 'var(--text-tertiary)' }}>
                    <FaCamera size={18} />
                    <span className='text-[10px] font-medium'>Photo</span>
                  </div>
                )}
              </div>
              {data.profile_pic && (
                <button
                  type='button'
                  onClick={handleClearUploadPhoto}
                  className='absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center border-none'
                  style={{ background: '#ef4444', color: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.25)' }}
                  aria-label='Remove photo'
                >
                  <IoClose size={11} />
                </button>
              )}
              <input type='file' id='profile_pic' className='hidden' onChange={handleUploadPhoto} accept='image/*' />
            </label>
          </div>

          <form onSubmit={handleSubmit} className='flex flex-col gap-3.5'>
            {FIELDS.map(({ id, type, label, placeholder }) => (
              <div key={id} className='flex flex-col gap-1.5'>
                <label htmlFor={id} className='text-[13px] font-medium' style={{ color: 'var(--text-secondary)' }}>
                  {label}
                </label>
                <input
                  type={type}
                  id={id}
                  name={id}
                  placeholder={placeholder}
                  value={data[id]}
                  onChange={handleOnChange}
                  required
                  className='input-field'
                />
              </div>
            ))}

            <button
              type='submit'
              disabled={isLoading}
              className='btn-primary w-full py-3 mt-1 text-[14px] font-semibold'
              style={{ borderRadius: 10 }}
            >
              {isLoading ? 'Creating account...' : 'Create Account →'}
            </button>
          </form>

          <p className='mt-5 text-center text-[13px]' style={{ color: 'var(--text-tertiary)' }}>
            Already have an account?{' '}
            <Link to='/email' className='font-semibold' style={{ color: 'var(--color-accent)' }}>
              Sign in
            </Link>
          </p>
        </>
      ) : (
        <form onSubmit={handleVerifyOTP} className='flex flex-col gap-3.5'>
          <div className='flex flex-col gap-1.5'>
            <label htmlFor="otp" className='text-[13px] font-medium' style={{ color: 'var(--text-secondary)' }}>
              Verification Code
            </label>
            <input
              type="text"
              id="otp"
              name="otp"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              className='input-field text-center tracking-[0.5em] font-bold text-lg'
              maxLength={6}
            />
          </div>

          <button
            type='submit'
            disabled={isLoading || otp.length < 6}
            className='btn-primary w-full py-3 mt-1 text-[14px] font-semibold'
            style={{ borderRadius: 10 }}
          >
            {isLoading ? 'Verifying...' : 'Verify Email'}
          </button>
          
          <p className='mt-5 text-center text-[13px]' style={{ color: 'var(--text-tertiary)' }}>
            Didn't receive the code?{' '}
            <button type="button" onClick={handleSubmit} className='font-semibold border-none bg-transparent' style={{ color: 'var(--color-accent)' }}>
              Resend
            </button>
          </p>
        </form>
      )}
    </AuthCard>
  )
}

export default RegisterPage
