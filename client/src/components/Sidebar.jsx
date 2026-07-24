import React, { useEffect, useState, useCallback, useRef } from 'react'
import { FaUserPlus } from "react-icons/fa";
import { NavLink, useNavigate } from 'react-router-dom';
import { BiLogOut, BiMessageSquareAdd } from "react-icons/bi";
import { BsThreeDots, BsSunFill, BsMoonStarsFill } from "react-icons/bs";
import { useTheme } from '../context/ThemeContext';
import { IoSearchOutline } from "react-icons/io5";
import { MdOutlineEdit } from "react-icons/md";
import Avatar from './Avatar'
import { useDispatch, useSelector } from 'react-redux';
import EditUserDetails from './EditUserDetails';
import SearchUser from './SearchUser';
import GroupModal from './GroupModal';
import { logout, setConversations } from '../redux/userSlice';
import moment from 'moment';
import api from '../helpers/axios';

const Sidebar = () => {
  const user = useSelector(state => state?.user)
  const allUser = useSelector(state => state?.user?.conversations) || []
  const [editUserOpen, setEditUserOpen] = useState(false)
  const [openSearchUser, setOpenSearchUser] = useState(false)
  const [openGroupModal, setOpenGroupModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showMenu, setShowMenu] = useState(false)
  const socketConnection = useSelector(state => state?.user?.socketConnection)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isDark, toggleTheme } = useTheme()
  const menuRef = useRef(null)

  useEffect(() => {
    if (socketConnection) {
      socketConnection.emit('sidebar', user._id)
      
      const handleConversation = (data) => {
        const conversationUserData = data.map((conversationUser) => {
          if (conversationUser.isGroup) {
            // LOCK: always use groupName for group chats, never override with user details
            return { ...conversationUser, userDetails: null }
          }
          if (conversationUser?.sender?._id === conversationUser?.receiver?._id) {
            return { ...conversationUser, userDetails: conversationUser?.sender }
          } else if (conversationUser?.receiver?._id !== user?._id) {
            return { ...conversationUser, userDetails: conversationUser.receiver }
          } else {
            return { ...conversationUser, userDetails: conversationUser.sender }
          }
        })
        dispatch(setConversations(conversationUserData))
      }

      socketConnection.on('conversation', handleConversation)

      // ── Cleanup: remove listener on unmount/re-render ──
      return () => {
        socketConnection.off('conversation', handleConversation)
      }
    }
  }, [socketConnection, user._id, dispatch])

  // Close menu on Escape key
  useEffect(() => {
    if (!showMenu) return
    const handler = (e) => {
      if (e.key === 'Escape') setShowMenu(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [showMenu])

  // Close menu on outside click
  useEffect(() => {
    if (!showMenu) return
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showMenu])

  const handleLogout = useCallback(async () => {
    try {
      await api.get(`${import.meta.env.VITE_BACKEND_URL}/api/logout`)
    } catch (error) {
      console.error('Logout API error:', error)
    }
    dispatch(logout())
    navigate("/email")
    localStorage.removeItem('token')
  }, [dispatch, navigate])

  const filteredUsers = allUser.filter(conv => {
    const name = conv?.isGroup ? conv?.groupName : conv?.userDetails?.name
    return name?.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const formatTime = (dateStr) => {
    if (!dateStr) return ''
    const date = moment(dateStr)
    const now = moment()
    if (date.isSame(now, 'day')) return date.format('h:mm A')
    if (date.isSame(now.clone().subtract(1, 'day'), 'day')) return 'Yesterday'
    if (date.isSame(now, 'week')) return date.format('ddd')
    return date.format('MM/DD/YY')
  }

  return (
    <div
      className='w-full h-full flex flex-col'
      style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-primary)' }}
    >
      {/* ── Header: user info + actions ─────────────────── */}
      <div
        className='flex-shrink-0 flex items-center justify-between px-4 py-3.5'
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <button
          onClick={() => setEditUserOpen(true)}
          className='flex items-center gap-3 flex-1 min-w-0 bg-transparent border-none p-0'
          title='Edit profile'
          aria-label='Edit profile'
        >
          <div className='flex-shrink-0'>
            <Avatar width={36} height={36} name={user?.name} imageUrl={user?.profile_pic} userId={user?._id} />
          </div>
          <div className='flex-1 min-w-0 text-left'>
            <p className='font-semibold text-[13px] truncate' style={{ color: 'var(--text-primary)' }}>
              {user?.name}
            </p>
            <p className='text-[11px] flex items-center gap-1.5 mt-0.5' style={{ color: '#4ade80' }}>
              <span className='w-1.5 h-1.5 rounded-full inline-block flex-shrink-0 animate-pulse-dot' style={{ background: '#4ade80' }} />
              Active
            </p>
          </div>
        </button>

        <div className='flex items-center gap-1 flex-shrink-0'>
          <button
            title={isDark ? 'Switch to light' : 'Switch to dark'}
            onClick={toggleTheme}
            className='btn-icon'
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <BsSunFill size={14} /> : <BsMoonStarsFill size={14} />}
          </button>
          <button
            title='New group'
            onClick={() => setOpenGroupModal(true)}
            className='btn-icon'
            aria-label='Create new group'
          >
            <FaUserPlus size={15} />
          </button>
          <button
            title='New chat'
            onClick={() => setOpenSearchUser(true)}
            className='btn-icon'
            aria-label='Start new conversation'
          >
            <BiMessageSquareAdd size={16} />
          </button>
          <div className='relative' ref={menuRef}>
            <button
              title='Menu'
              onClick={() => setShowMenu(p => !p)}
              className='btn-icon'
              aria-label='Open menu'
              aria-expanded={showMenu}
              aria-haspopup="true"
            >
              <BsThreeDots size={15} />
            </button>
            {showMenu && (
              <div className='dropdown-menu right-0 top-9 w-44' role="menu" aria-label="User menu">
                <button
                  onClick={() => { setEditUserOpen(true); setShowMenu(false) }}
                  className='dropdown-item'
                  role="menuitem"
                >
                  <MdOutlineEdit size={14} style={{ color: 'var(--text-tertiary)' }} />
                  Edit profile
                </button>
                <button
                  onClick={() => { handleLogout(); setShowMenu(false) }}
                  className='dropdown-item danger'
                  role="menuitem"
                  style={{ borderTop: '1px solid var(--border-subtle)' }}
                >
                  <BiLogOut size={14} />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Search bar ──────────────────────────────────── */}
      <div className='flex-shrink-0 px-3 py-2.5' style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div
          className='flex items-center gap-2 rounded-lg px-3 py-2'
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-primary)' }}
        >
          <IoSearchOutline size={14} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
          <input
            type='text'
            placeholder='Search conversations...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className='flex-1 bg-transparent border-none outline-none text-[13px]'
            style={{ color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}
            aria-label='Search conversations'
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className='bg-transparent border-none text-[11px] p-0'
              style={{ color: 'var(--text-tertiary)' }}
              aria-label='Clear search'
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ── Section label ───────────────────────────────── */}
      <div className='px-4 pt-3 pb-1.5 flex-shrink-0'>
        <span className='text-[10px] font-semibold tracking-wider uppercase' style={{ color: 'var(--text-tertiary)' }}>
          {searchQuery ? 'Results' : 'Messages'}
        </span>
      </div>

      {/* ── Conversations list ──────────────────────────── */}
      <div className='flex-1 overflow-y-auto overflow-x-hidden px-2 pb-3' role="list" aria-label="Conversations">
        {filteredUsers.length === 0 && (
          <div className='flex flex-col items-center justify-center py-16 px-6 text-center'>
            <div
              className='w-12 h-12 rounded-xl flex items-center justify-center mb-3'
              style={{ background: 'var(--color-accent-soft)' }}
            >
              <FaUserPlus size={18} style={{ color: 'var(--color-accent)' }} />
            </div>
            <p className='font-semibold text-[13px] mb-1' style={{ color: 'var(--text-secondary)' }}>
              {searchQuery ? 'No results' : 'No conversations yet'}
            </p>
            <p className='text-[12px] leading-relaxed' style={{ color: 'var(--text-tertiary)' }}>
              {searchQuery ? `Nothing matching "${searchQuery}"` : 'Start a new conversation using the edit icon above'}
            </p>
          </div>
        )}

        {filteredUsers.map((conv) => (
          <NavLink
            to={"/home/" + (conv?.isGroup ? conv?._id : conv?.userDetails?._id)}
            key={conv?._id}
            className={({ isActive }) => `conv-item ${isActive ? 'active' : ''}`}
            role="listitem"
          >
            <div className='flex-shrink-0'>
              <Avatar 
                imageUrl={conv?.isGroup ? null : conv?.userDetails?.profile_pic} 
                name={conv?.isGroup ? conv?.groupName : conv?.userDetails?.name} 
                width={42} 
                height={42} 
                userId={conv?.isGroup ? conv?._id : conv?.userDetails?._id} 
              />
            </div>
            <div className='flex-1 min-w-0'>
              <div className='flex justify-between items-center mb-0.5'>
                <span
                  className='text-[13px] truncate max-w-[120px]'
                  style={{
                    color: conv?.unseenMsg ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: conv?.unseenMsg ? 600 : 400,
                  }}
                >
                  {conv?.isGroup ? conv?.groupName : conv?.userDetails?.name}
                </span>
                <span
                  className='text-[10px] flex-shrink-0 ml-2'
                  style={{
                    color: conv?.unseenMsg ? 'var(--text-accent)' : 'var(--text-tertiary)',
                    fontWeight: conv?.unseenMsg ? 600 : 400,
                  }}
                >
                  {formatTime(conv?.lastMsg?.createdAt)}
                </span>
              </div>
              <div className='flex justify-between items-center gap-2'>
                <div
                  className='text-[12px] truncate max-w-[150px]'
                  style={{
                    color: conv?.unseenMsg ? 'var(--text-secondary)' : 'var(--text-tertiary)',
                    fontWeight: conv?.unseenMsg ? 500 : 400,
                  }}
                >
                  {conv?.lastMsg?.imageUrl && !conv?.lastMsg?.text && <span>📷 Photo</span>}
                  {conv?.lastMsg?.videoUrl && !conv?.lastMsg?.text && <span>🎥 Video</span>}
                  {conv?.lastMsg?.text && conv?.lastMsg?.text}
                  {!conv?.lastMsg?.text && !conv?.lastMsg?.imageUrl && !conv?.lastMsg?.videoUrl && (
                    <em style={{ color: 'var(--text-tertiary)', fontSize: 11 }}>No messages yet</em>
                  )}
                </div>
                {Boolean(conv?.unseenMsg) && (
                  <span className='badge'>{conv?.unseenMsg}</span>
                )}
              </div>
            </div>
          </NavLink>
        ))}
      </div>

      {/* ── New Chat Button ─────────────────────────────── */}
      <div className='flex-shrink-0 p-3' style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <button
          onClick={() => setOpenSearchUser(true)}
          className='btn-primary w-full text-[13px] font-semibold py-2.5'
          style={{ borderRadius: 10 }}
          aria-label='Start new conversation'
        >
          <FaUserPlus size={13} />
          New Conversation
        </button>
      </div>

      {/* ── Modals ──────────────────────────────────────── */}
      {editUserOpen && <EditUserDetails onClose={() => setEditUserOpen(false)} user={user} />}
      {openSearchUser && <SearchUser onClose={() => setOpenSearchUser(false)} />}
      {openGroupModal && <GroupModal onClose={() => setOpenGroupModal(false)} />}
    </div>
  )
}

export default Sidebar
