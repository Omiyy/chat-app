import React, { useEffect, useRef, useState } from 'react'
import Avatar from './Avatar'
import uploadFile from '../helpers/uploadFile'
import api from '../helpers/axios'
import toast from 'react-hot-toast'
import { useDispatch } from 'react-redux'
import { setUser } from '../redux/userSlice'
import { IoClose } from "react-icons/io5";
import { FaCamera } from "react-icons/fa";

const EditUserDetails = ({ onClose, user }) => {
  const [data, setData] = useState({
    name: user?.name,
    profile_pic: user?.profile_pic
  })
  const [uploading, setUploading] = useState(false)
  const uploadPhotoRef = useRef()
  const dispatch = useDispatch()

  useEffect(() => {
    setData({ name: user?.name, profile_pic: user?.profile_pic })
  }, [user])

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const handleOnChange = (e) => {
    const { name, value } = e.target
    setData(prev => ({ ...prev, [name]: value }))
  }

  const handleUploadPhoto = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const uploadPhoto = await uploadFile(file)
      setData(prev => ({ ...prev, profile_pic: uploadPhoto?.url }))
    } catch (err) {
      toast.error(err.message || 'Failed to upload photo')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      const URL = `${import.meta.env.VITE_BACKEND_URL}/api/update-user`
      const response = await api.post(URL, data)
      toast.success(response?.data?.message)
      if (response.data.success) {
        dispatch(setUser(response.data.data))
        onClose()
      }
    } catch (error) {
      toast.error('Failed to update profile')
    }
  }

  return (
    <div
      className='modal-overlay'
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-label="Edit profile"
    >
      <div className='modal-card max-w-sm'>
        {/* Header */}
        <div className='flex items-center justify-between px-5 py-4' style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <div>
            <h2 className='font-bold text-base' style={{ color: 'var(--text-primary)' }}>Edit Profile</h2>
            <p className='text-xs mt-0.5' style={{ color: 'var(--text-tertiary)' }}>Update your name and photo</p>
          </div>
          <button onClick={onClose} className='btn-icon' aria-label='Close'>
            <IoClose size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className='p-5 flex flex-col gap-5'>
          {/* Avatar upload */}
          <div className='flex flex-col items-center gap-3'>
            <div className='relative'>
              <Avatar
                width={80}
                height={80}
                imageUrl={data?.profile_pic}
                name={data?.name}
                userId={user?._id}
              />
              <button
                type='button'
                onClick={() => uploadPhotoRef.current.click()}
                className='absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center border-none'
                style={{
                  background: 'var(--color-accent)',
                  color: '#fff',
                  boxShadow: '0 2px 8px var(--color-accent-glow)',
                }}
                disabled={uploading}
                aria-label='Upload profile photo'
              >
                <FaCamera size={11} />
              </button>
              <input
                type='file'
                ref={uploadPhotoRef}
                className='hidden'
                onChange={handleUploadPhoto}
                accept='image/*'
              />
            </div>
            {uploading && <p className='text-xs' style={{ color: 'var(--text-accent)' }}>Uploading...</p>}
          </div>

          {/* Name field */}
          <div className='flex flex-col gap-1.5'>
            <label htmlFor='name' className='text-sm font-medium' style={{ color: 'var(--text-secondary)' }}>
              Display Name
            </label>
            <input
              type='text'
              name='name'
              id='name'
              value={data.name}
              onChange={handleOnChange}
              className='input-field'
              placeholder='Your name'
            />
          </div>

          {/* Actions */}
          <div className='flex gap-3 pt-1'>
            <button
              type='button'
              onClick={onClose}
              className='btn-secondary flex-1 text-[13px]'
            >
              Cancel
            </button>
            <button
              type='submit'
              className='btn-primary flex-1 text-[13px]'
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default React.memo(EditUserDetails)
