import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link, useParams } from 'react-router-dom'
import Avatar from './Avatar'
import { HiDotsVertical } from "react-icons/hi";
import { FaAngleLeft } from "react-icons/fa6";
import { FaImage } from "react-icons/fa6";
import { FaVideo } from "react-icons/fa6";
import { MdOutlineEmojiEmotions, MdAttachFile } from "react-icons/md";
import uploadFile from '../helpers/uploadFile';
import { IoClose } from "react-icons/io5";
import { IoMdSend } from "react-icons/io";
import { BsCheck2All } from "react-icons/bs";
import Loading from './Loading';
import toast from 'react-hot-toast';
import { setChatCache } from '../redux/userSlice';
import moment from 'moment'

const EMOJIS = ["😊","😂","❤️","🔥","👍","🎉","😮","😢","🤔","💯","✨","👀"]

// Basic URL validation for media sources
const isValidMediaUrl = (url) => {
  if (!url) return false
  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

const MessagePage = () => {
  const params = useParams()
  const socketConnection = useSelector(state => state?.user?.socketConnection)
  const user = useSelector(state => state?.user)

  const [dataUser, setDataUser] = useState({ name: '', email: '', profile_pic: '', online: false, _id: '' })
  const [openAttachMenu, setOpenAttachMenu] = useState(false)
  const [showEmoji, setShowEmoji] = useState(false)
  const [message, setMessage] = useState({ text: '', imageUrl: '', videoUrl: '' })
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()
  const chatCache = useSelector(state => state?.user?.chatCache) || {}
  const [allMessage, setAllMessage] = useState(chatCache[params.userId] || [])
  const [inputFocused, setInputFocused] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const attachMenuRef = useRef(null)

  // Instantly load cached messages when switching tabs
  useEffect(() => {
    setAllMessage(chatCache[params.userId] || [])
  }, [params.userId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [allMessage])

  useEffect(() => {
    const handler = (e) => {
      if (attachMenuRef.current && !attachMenuRef.current.contains(e.target)) {
        setOpenAttachMenu(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Close emoji picker on Escape
  useEffect(() => {
    if (!showEmoji) return
    const handler = (e) => { if (e.key === 'Escape') setShowEmoji(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [showEmoji])

  useEffect(() => {
    if (socketConnection) {
      socketConnection.emit('message-page', params.userId)
      socketConnection.emit('seen', params.userId)
      socketConnection.on('message-user', (data) => setDataUser(data))
      socketConnection.on('message', (data) => {
        if (Array.isArray(data)) {
          setAllMessage(data)
          dispatch(setChatCache({ chatId: params.userId, messages: data }))
        } else {
          // If the message is for the currently open chat, update the UI
          if (data.userId === params.userId) {
            setAllMessage(data.messages)
          }
          // Always update the Redux cache, even for background chats
          dispatch(setChatCache({ chatId: data.userId, messages: data.messages }))
        }
      })
    }
  }, [socketConnection, params?.userId, user, dispatch])

  const handleUploadImage = useCallback(async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setLoading(true)
    try {
      const result = await uploadFile(file)
      setMessage(p => ({ ...p, imageUrl: result.url }))
    } catch (err) {
      toast.error(err.message || 'Failed to upload image')
    } finally {
      setLoading(false)
      setOpenAttachMenu(false)
    }
  }, [])

  const handleUploadVideo = useCallback(async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setLoading(true)
    try {
      const result = await uploadFile(file)
      setMessage(p => ({ ...p, videoUrl: result.url }))
    } catch (err) {
      toast.error(err.message || 'Failed to upload video')
    } finally {
      setLoading(false)
      setOpenAttachMenu(false)
    }
  }, [])

  const handleSendMessage = useCallback((e) => {
    e.preventDefault()
    if (!message.text.trim() && !message.imageUrl && !message.videoUrl) return
    if (socketConnection) {
      socketConnection.emit('new message', {
        sender: user?._id,
        receiver: params.userId,
        text: message.text,
        imageUrl: message.imageUrl,
        videoUrl: message.videoUrl,
        msgByUserId: user?._id,
        isGroup: dataUser?.isGroup,
        conversationId: dataUser?.isGroup ? dataUser?._id : null
      })
      setMessage({ text: '', imageUrl: '', videoUrl: '' })
      inputRef.current?.focus()
    }
  }, [message, socketConnection, user?._id, params.userId])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(e)
    }
  }, [handleSendMessage])

  const groupedMessages = allMessage.reduce((acc, msg, idx) => {
    const dateKey = moment(msg.createdAt).format('YYYY-MM-DD')
    const prev = allMessage[idx - 1]
    const prevDateKey = prev ? moment(prev.createdAt).format('YYYY-MM-DD') : null
    if (dateKey !== prevDateKey) {
      acc.push({ type: 'date', date: msg.createdAt, key: `date-${dateKey}` })
    }
    acc.push({ type: 'msg', ...msg })
    return acc
  }, [])

  const formatDate = (dateStr) => {
    return moment(dateStr).calendar(null, {
      sameDay: '[Today]', lastDay: '[Yesterday]', lastWeek: 'dddd', sameElse: 'MMMM D, YYYY',
    })
  }

  const handleImageClick = useCallback((url) => {
    if (isValidMediaUrl(url)) {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }, [])

  return (
    <div className='flex flex-col h-full' style={{ background: 'var(--bg-primary)' }}>

      {/* ── Header ──────────────────────────────────────── */}
      <header
        className='flex-shrink-0 h-16 flex items-center justify-between px-5 z-10'
        style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-subtle)' }}
      >
        <div className='flex items-center gap-3'>
          <Link
            to='/home'
            className='btn-icon md:hidden'
            aria-label='Back to conversations'
          >
            <FaAngleLeft size={18} />
          </Link>
          <div className='flex items-center gap-3'>
            <Avatar width={38} height={38} imageUrl={dataUser?.profile_pic} name={dataUser?.name} userId={dataUser?._id} />
            <div>
              <h3 className='font-semibold text-[15px]' style={{ color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>
                {dataUser?.name || '...'}
              </h3>
              <div className='flex items-center gap-1.5 text-[11px] mt-0.5'>
                {dataUser.isGroup ? (
                  <span style={{ color: 'var(--text-tertiary)' }}>
                    {dataUser.participants?.length} participants
                  </span>
                ) : dataUser.online ? (
                  <>
                    <span className='w-1.5 h-1.5 rounded-full inline-block animate-pulse-dot' style={{ background: '#4ade80' }} />
                    <span style={{ color: '#4ade80' }}>Online</span>
                  </>
                ) : (
                  <span style={{ color: 'var(--text-tertiary)' }}>
                    {dataUser.last_seen ? `Last seen ${moment(dataUser.last_seen).fromNow()}` : 'Offline'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        <button className='btn-icon' title='More options' aria-label='More options'>
          <HiDotsVertical size={18} />
        </button>
      </header>

      {/* ── Messages ────────────────────────────────────── */}
      <section
        className='flex-1 overflow-y-auto overflow-x-hidden px-5 py-6 flex flex-col'
        aria-label='Messages'
      >
        {allMessage.length === 0 && !loading && (
          <div className='flex flex-col items-center justify-center h-full gap-3 animate-fade-in'>
            <Avatar width={52} height={52} name={dataUser?.name} userId={dataUser?._id} imageUrl={dataUser?.profile_pic} />
            <p className='text-sm font-medium' style={{ color: 'var(--text-secondary)' }}>
              Start the conversation
            </p>
            <p className='text-[12px]' style={{ color: 'var(--text-tertiary)' }}>
              Say hi to {dataUser?.name || 'your contact'} 👋
            </p>
          </div>
        )}

        <div className='flex flex-col gap-0.5 max-w-[680px] mx-auto w-full'>
          {groupedMessages.map((item) => {
            if (item.type === 'date') {
              return (
                <div key={item.key} className='flex items-center gap-4 my-5'>
                  <div className='flex-1 h-px' style={{ background: 'var(--border-subtle)' }} />
                  <span className='text-[10px] font-semibold tracking-wider uppercase whitespace-nowrap' style={{ color: 'var(--text-tertiary)' }}>
                    {formatDate(item.date)}
                  </span>
                  <div className='flex-1 h-px' style={{ background: 'var(--border-subtle)' }} />
                </div>
              )
            }

            const isMine = user._id === (item?.msgByUserId?._id || item?.msgByUserId)
            const prev = groupedMessages[groupedMessages.indexOf(item) - 1]
            const consec = prev && prev.type === 'msg' && (prev?.msgByUserId?._id || prev?.msgByUserId) === (item?.msgByUserId?._id || item?.msgByUserId)

            return (
              <div
                key={item._id || item.key}
                className='msg-bubble flex items-end gap-2'
                style={{
                  justifyContent: isMine ? 'flex-end' : 'flex-start',
                  marginBottom: consec ? 2 : 12,
                }}
              >
                {/* Their avatar */}
                {!isMine && (
                  <div className='flex-shrink-0' style={{ opacity: consec ? 0 : 1, transition: 'opacity 0.15s' }}>
                    <Avatar 
                      width={28} height={28} 
                      imageUrl={dataUser?.isGroup ? item?.msgByUserId?.profile_pic : dataUser?.profile_pic} 
                      name={dataUser?.isGroup ? item?.msgByUserId?.name : dataUser?.name} 
                      userId={dataUser?.isGroup ? (item?.msgByUserId?._id || item?.msgByUserId) : dataUser?._id} 
                    />
                  </div>
                )}

                <div className='max-w-[65%] relative flex flex-col' style={{ alignItems: isMine ? 'flex-end' : 'flex-start' }}>
                  <div
                    className='px-3.5 py-2.5'
                    style={{
                      borderRadius: 16,
                      background: isMine ? 'var(--msg-own-bg)' : 'var(--msg-their-bg)',
                      borderBottomRightRadius: isMine ? (consec ? 16 : 4) : 16,
                      borderBottomLeftRadius: !isMine ? (consec ? 16 : 4) : 16,
                    }}
                  >
                    {/* Image */}
                    {item?.imageUrl && isValidMediaUrl(item.imageUrl) && (
                      <img
                        src={item.imageUrl}
                        alt='Shared image'
                        className='rounded-lg max-w-full object-cover block cursor-pointer'
                        style={{ maxHeight: 220, marginBottom: item.text ? 8 : 0 }}
                        onClick={() => handleImageClick(item.imageUrl)}
                        loading="lazy"
                      />
                    )}
                    {/* Video */}
                    {item?.videoUrl && isValidMediaUrl(item.videoUrl) && (
                      <video
                        src={item.videoUrl}
                        className='rounded-lg max-w-full block'
                        style={{ maxHeight: 220, marginBottom: item.text ? 8 : 0 }}
                        controls
                      />
                    )}
                    {/* Group Sender Name */}
                    {!isMine && dataUser?.isGroup && (
                      <p className='text-[10.5px] font-semibold mb-1 truncate max-w-[200px]' style={{ color: 'var(--color-accent)' }}>
                        {item?.msgByUserId?.name}
                      </p>
                    )}
                    {/* Text */}
                    {item.text && (
                      <p
                        className='text-[14px] leading-relaxed break-words m-0'
                        style={{ color: isMine ? 'var(--msg-own-text)' : 'var(--msg-their-text)' }}
                      >
                        {item.text}
                      </p>
                    )}
                    {/* Timestamp */}
                    <div className='flex items-center justify-end gap-1 mt-1'>
                      <span
                        className='text-[10px] whitespace-nowrap'
                        style={{ color: isMine ? 'rgba(255,255,255,0.5)' : 'var(--text-tertiary)' }}
                      >
                        {moment(item.createdAt).format('h:mm A')}
                      </span>
                      {isMine && (
                        <BsCheck2All 
                          size={16} 
                          style={{ 
                            color: item.seen ? '#00e5ff' : 'rgba(255,255,255,0.8)',
                            strokeWidth: 0.5 
                          }} 
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* My avatar */}
                {isMine && (
                  <div className='flex-shrink-0' style={{ opacity: consec ? 0 : 1, transition: 'opacity 0.15s' }}>
                    <Avatar width={28} height={28} imageUrl={user?.profile_pic} name={user?.name} userId={user?._id} />
                  </div>
                )}
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Upload indicator */}
        {loading && (
          <div
            className='fixed bottom-24 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-2.5 rounded-xl animate-fade-in-up'
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-primary)', boxShadow: 'var(--shadow-md)' }}
          >
            <Loading size={18} />
            <span className='text-[12px]' style={{ color: 'var(--text-secondary)' }}>Uploading...</span>
          </div>
        )}
      </section>

      {/* ── Media Preview ───────────────────────────────── */}
      {(message.imageUrl || message.videoUrl) && (
        <div className='flex-shrink-0 px-5 py-3' style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-subtle)' }}>
          <div className='flex items-center gap-3 max-w-[680px] mx-auto'>
            <div className='relative inline-block'>
              {message.imageUrl && (
                <img
                  src={message.imageUrl}
                  alt='Preview'
                  className='w-16 h-16 object-cover rounded-lg'
                  style={{ border: '1px solid var(--border-primary)' }}
                />
              )}
              {message.videoUrl && (
                <video
                  src={message.videoUrl}
                  className='w-16 h-16 object-cover rounded-lg'
                  style={{ border: '1px solid var(--border-primary)' }}
                />
              )}
              <button
                onClick={() => setMessage(p => ({ ...p, imageUrl: '', videoUrl: '' }))}
                className='absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center border-none'
                style={{ background: 'var(--bg-hover)', color: 'var(--text-primary)' }}
                aria-label='Remove attachment'
              >
                <IoClose size={10} />
              </button>
            </div>
            <p className='text-[12px]' style={{ color: 'var(--text-tertiary)' }}>
              {message.imageUrl ? 'Image ready to send' : 'Video ready to send'}
            </p>
          </div>
        </div>
      )}

      {/* ── Input Bar ───────────────────────────────────── */}
      <div className='flex-shrink-0 px-5 py-3.5 relative' style={{ borderTop: '1px solid var(--border-subtle)' }}>
        {/* Emoji Picker */}
        {showEmoji && (
          <div
            className='absolute left-5 animate-fade-in-up flex flex-wrap gap-1 p-3 rounded-xl z-20'
            style={{
              bottom: 'calc(100% - 4px)',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-primary)',
              width: 220,
              boxShadow: 'var(--shadow-lg)',
            }}
            role="listbox"
            aria-label="Emoji picker"
          >
            {EMOJIS.map(em => (
              <button
                key={em}
                onClick={() => { setMessage(p => ({ ...p, text: p.text + em })); setShowEmoji(false); inputRef.current?.focus() }}
                className='bg-transparent border-none text-[22px] p-1 rounded-lg leading-none hover:bg-[var(--bg-hover)]'
                role="option"
                aria-label={em}
              >
                {em}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSendMessage}>
          <div
            className='flex items-center gap-1.5 rounded-xl px-2 py-1.5 max-w-[680px] mx-auto'
            style={{
              background: 'var(--bg-secondary)',
              border: `1.5px solid ${inputFocused ? 'var(--color-accent)' : 'var(--border-primary)'}`,
              transition: 'border-color 0.2s, box-shadow 0.2s',
              boxShadow: inputFocused ? '0 0 0 3px var(--ring-accent)' : 'none',
            }}
          >
            {/* Attach */}
            <div ref={attachMenuRef} className='relative flex-shrink-0'>
              <button
                type='button'
                onClick={() => setOpenAttachMenu(p => !p)}
                className='btn-icon'
                title='Attach file'
                aria-label='Attach file'
                aria-expanded={openAttachMenu}
              >
                <MdAttachFile size={19} />
              </button>
              {openAttachMenu && (
                <div
                  className='dropdown-menu bottom-11 left-0 w-44'
                  role="menu"
                  aria-label="Attachment options"
                >
                  <p className='px-4 pt-3 pb-1.5 text-[10px] font-semibold tracking-wider uppercase' style={{ color: 'var(--text-tertiary)' }}>
                    Attach
                  </p>
                  <label
                    htmlFor='uploadImage'
                    className='dropdown-item cursor-pointer'
                    role="menuitem"
                  >
                    <div className='w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0' style={{ background: 'var(--color-accent-soft)' }}>
                      <FaImage size={13} style={{ color: 'var(--color-accent)' }} />
                    </div>
                    Image
                  </label>
                  <label
                    htmlFor='uploadVideo'
                    className='dropdown-item cursor-pointer'
                    role="menuitem"
                    style={{ borderTop: '1px solid var(--border-subtle)' }}
                  >
                    <div className='w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0' style={{ background: 'var(--color-accent-soft)' }}>
                      <FaVideo size={13} style={{ color: 'var(--color-accent)' }} />
                    </div>
                    Video
                  </label>
                  <input type='file' id='uploadImage' onChange={handleUploadImage} className='hidden' accept='image/jpeg,image/png,image/gif,image/webp' />
                  <input type='file' id='uploadVideo' onChange={handleUploadVideo} className='hidden' accept='video/mp4,video/webm,video/ogg' />
                </div>
              )}
            </div>

            {/* Emoji */}
            <button
              type='button'
              onClick={() => setShowEmoji(s => !s)}
              className='btn-icon'
              style={{ color: showEmoji ? 'var(--color-accent)' : undefined }}
              title='Emoji'
              aria-label='Open emoji picker'
              aria-expanded={showEmoji}
            >
              <MdOutlineEmojiEmotions size={20} />
            </button>

            {/* Input */}
            <input
              ref={inputRef}
              type='text'
              placeholder='Type a message…'
              className='flex-1 bg-transparent border-none outline-none text-[14px] leading-normal py-0.5'
              style={{ color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}
              value={message.text}
              onChange={e => setMessage(p => ({ ...p, text: e.target.value }))}
              onKeyDown={handleKeyDown}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              autoComplete='off'
              aria-label='Message input'
            />

            {/* Send */}
            {(message.text.trim() || message.imageUrl || message.videoUrl) && (
              <button
                type='submit'
                className='flex items-center justify-center flex-shrink-0 border-none'
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'var(--color-accent)',
                  transition: 'background 0.15s',
                }}
                aria-label='Send message'
              >
                <IoMdSend size={16} style={{ color: '#fff', transform: 'translateX(1px)' }} />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default MessagePage
