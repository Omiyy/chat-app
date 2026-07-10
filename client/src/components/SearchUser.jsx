import React, { useEffect, useState, useCallback, useRef } from 'react'
import { IoSearchOutline, IoClose } from "react-icons/io5";
import Loading from './Loading';
import UserSearchCard from './UserSearchCard';
import toast from 'react-hot-toast'
import api from '../helpers/axios';

const SearchUser = ({ onClose }) => {
  const [searchUser, setSearchUser] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const debounceRef = useRef(null)

  const handleSearchUser = useCallback(async (query) => {
    const URL = `${import.meta.env.VITE_BACKEND_URL}/api/search-user`
    try {
      setLoading(true)
      const response = await api.post(URL, { search: query })
      setLoading(false)
      setSearchUser(response.data.data)
    } catch (error) {
      setLoading(false)
      toast.error(error?.response?.data?.message || 'Search failed')
    }
  }, [])

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      handleSearchUser(search)
    }, 300)
    return () => clearTimeout(debounceRef.current)
  }, [search, handleSearchUser])

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      className='modal-overlay items-start pt-16'
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-label="Search for users"
    >
      <div className='modal-card max-w-md animate-fade-in-up'>
        {/* Search header */}
        <div className='flex items-center gap-3 px-4 py-3.5' style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <IoSearchOutline size={18} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
          <input
            type='text'
            placeholder='Search by name or email...'
            className='flex-1 bg-transparent border-none outline-none text-[13px]'
            style={{ color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}
            onChange={(e) => setSearch(e.target.value)}
            value={search}
            autoFocus
            aria-label='Search users'
          />
          <button
            onClick={onClose}
            className='btn-icon'
            style={{ width: 28, height: 28 }}
            aria-label='Close search'
          >
            <IoClose size={16} />
          </button>
        </div>

        {/* Results */}
        <div className='max-h-[60vh] overflow-y-auto'>
          {loading && (
            <div className='flex justify-center items-center py-12'>
              <Loading />
            </div>
          )}

          {!loading && searchUser.length === 0 && (
            <div className='flex flex-col items-center justify-center py-14 text-center px-4'>
              <div
                className='w-11 h-11 rounded-full flex items-center justify-center mb-3'
                style={{ background: 'var(--color-accent-soft)' }}
              >
                <IoSearchOutline size={18} style={{ color: 'var(--color-accent)' }} />
              </div>
              <p className='font-semibold text-sm' style={{ color: 'var(--text-secondary)' }}>No users found</p>
              <p className='text-xs mt-1' style={{ color: 'var(--text-tertiary)' }}>Try a different name or email</p>
            </div>
          )}

          {!loading && searchUser.length > 0 && (
            <div className='p-2'>
              {searchUser.map((user) => (
                <UserSearchCard key={user._id} user={user} onClose={onClose} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SearchUser
