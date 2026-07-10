import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../helpers/axios'
import toast from 'react-hot-toast';
import Avatar from '../components/Avatar';
import { useDispatch } from 'react-redux';
import { setToken } from '../redux/userSlice';
import { FaLock } from 'react-icons/fa';
import { FaAngleLeft } from 'react-icons/fa6';
import AuthCard from '../components/AuthCard';

const CheckPasswordPage = () => {
  const [data, setData] = useState({ password: "", userId: "" })
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()

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
      const response = await api.post(URL, {
        userId: location?.state?._id,
        password: data.password,
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
    <AuthCard
      heroTitle={<>Almost<br />there!</>}
      heroSubtitle="Just one more step. Enter your password to access your account."
      heroFeatures={['End-to-end security', 'Private conversations', 'Your data, protected']}
    >
      {/* User info */}
      <div className='flex flex-col items-center mb-7'>
        <Avatar width={68} height={68} name={location?.state?.name} imageUrl={location?.state?.profile_pic} />
        <h3 className='font-bold text-[17px] mt-3 mb-0.5' style={{ color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
          {location?.state?.name}
        </h3>
        <p className='text-[13px]' style={{ color: 'var(--text-tertiary)' }}>{location?.state?.email}</p>
      </div>

      <h2 className='text-xl font-bold mb-1' style={{ color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
        Enter your password
      </h2>
      <p className='text-[13px] mb-6' style={{ color: 'var(--text-tertiary)' }}>
        Keep your account secure
      </p>

      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <div className='flex flex-col gap-1.5'>
          <label htmlFor='password' className='text-[13px] font-medium' style={{ color: 'var(--text-secondary)' }}>
            Password
          </label>
          <div className='relative'>
            <input
              type='password'
              name='password'
              id='password'
              placeholder='Enter your password'
              value={data.password}
              onChange={handleOnChange}
              required
              autoFocus
              className='input-field'
              style={{ paddingLeft: 40 }}
            />
            <FaLock size={13} className='absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none' style={{ color: 'var(--text-tertiary)' }} />
          </div>
        </div>

        <button
          type='submit'
          disabled={isLoading}
          className='btn-primary w-full py-3 mt-1 text-[14px] font-semibold'
          style={{ borderRadius: 10 }}
        >
          {isLoading ? 'Signing in...' : 'Sign In →'}
        </button>
      </form>

      <div className='flex justify-between items-center mt-6'>
        <button
          onClick={() => navigate('/email')}
          className='flex items-center gap-1.5 text-[13px] bg-transparent border-none p-0'
          style={{ color: 'var(--text-tertiary)', fontFamily: 'Inter, sans-serif' }}
        >
          <FaAngleLeft size={11} /> Back
        </button>
        <Link to='/forgot-password' className='text-[13px] font-semibold' style={{ color: 'var(--color-accent)' }}>
          Forgot password?
        </Link>
      </div>
    </AuthCard>
  )
}

export default CheckPasswordPage
