import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
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
import { BsCheck2All, BsMicFill } from "react-icons/bs";
import Loading from './Loading';
import moment from 'moment'

const EMOJIS = ["😊","😂","❤️","🔥","👍","🎉","😮","😢","🤔","💯","✨","👀"]

const MessagePage = () => {
  const params = useParams()
  const socketConnection = useSelector(state => state?.user?.socketConnection)
  const user = useSelector(state => state?.user)

  const [dataUser, setDataUser] = useState({ name: '', email: '', profile_pic: '', online: false, _id: '' })
  const [openAttachMenu, setOpenAttachMenu] = useState(false)
  const [showEmoji, setShowEmoji] = useState(false)
  const [message, setMessage] = useState({ text: '', imageUrl: '', videoUrl: '' })
  const [loading, setLoading] = useState(false)
  const [allMessage, setAllMessage] = useState([])
  const [inputFocused, setInputFocused] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const attachMenuRef = useRef(null)

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

  useEffect(() => {
    if (socketConnection) {
      socketConnection.emit('message-page', params.userId)
      socketConnection.emit('seen', params.userId)
      socketConnection.on('message-user', (data) => setDataUser(data))
      socketConnection.on('message', (data) => setAllMessage(data))
    }
  }, [socketConnection, params?.userId, user])

  const handleUploadImage = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setLoading(true)
    const result = await uploadFile(file)
    setLoading(false)
    setOpenAttachMenu(false)
    setMessage(p => ({ ...p, imageUrl: result.url }))
  }

  const handleUploadVideo = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setLoading(true)
    const result = await uploadFile(file)
    setLoading(false)
    setOpenAttachMenu(false)
    setMessage(p => ({ ...p, videoUrl: result.url }))
  }

  const handleSendMessage = (e) => {
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
      })
      setMessage({ text: '', imageUrl: '', videoUrl: '' })
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(e)
    }
  }

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

  const iconBtnStyle = { width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:8, border:'none', cursor:'pointer', color:'#5c587a', background:'transparent', transition:'background 0.15s, color 0.15s' }

  return (
    <div style={{display:'flex', flexDirection:'column', height:'100%', background:'#0a0a0f'}}>

      {/* Header */}
      <header style={{flexShrink:0, height:64, background:'#0a0a0f', borderBottom:'1px solid #1e1e28', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 20px', zIndex:10}}>
        <div style={{display:'flex', alignItems:'center', gap:14}}>
          <Link
            to='/home'
            style={{width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:8, color:'#5c587a', textDecoration:'none'}}
            className='md:hidden'
          >
            <FaAngleLeft size={18} />
          </Link>
          <div style={{display:'flex', alignItems:'center', gap:12, cursor:'pointer'}}>
            <Avatar width={40} height={40} imageUrl={dataUser?.profile_pic} name={dataUser?.name} userId={dataUser?._id} />
            <div>
              <h3 style={{fontFamily:'Syne, sans-serif', fontWeight:700, fontSize:15, letterSpacing:'-0.3px', color:'#f0eeff', margin:0}}>{dataUser?.name || '...'}</h3>
              <div style={{display:'flex', alignItems:'center', gap:5, fontSize:11.5, marginTop:1}}>
                {dataUser.online ? (
                  <>
                    <span style={{width:6, height:6, borderRadius:'50%', background:'#4ade80', display:'inline-block', animation:'pulse 2s infinite'}}/>
                    <span style={{color:'#4ade80'}}>Online</span>
                  </>
                ) : (
                  <span style={{color:'#5c587a'}}>Offline</span>
                )}
              </div>
            </div>
          </div>
        </div>
        <button style={iconBtnStyle} title='More options'
          onMouseEnter={e => { e.currentTarget.style.background='#18181f'; e.currentTarget.style.color='#a594f9' }}
          onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#5c587a' }}
        >
          <HiDotsVertical size={19} />
        </button>
      </header>

      {/* Messages */}
      <section
        className='messages-scroll'
        style={{flex:1, overflowY:'auto', overflowX:'hidden', padding:'24px 28px', display:'flex', flexDirection:'column'}}
      >
        {allMessage.length === 0 && !loading && (
          <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', gap:12, opacity:0.7}}>
            <Avatar width={56} height={56} name={dataUser?.name} userId={dataUser?._id} imageUrl={dataUser?.profile_pic} />
            <p style={{fontSize:14, color:'#9994b8', fontFamily:'Syne, sans-serif', fontWeight:600, margin:0}}>Start the conversation</p>
            <p style={{fontSize:12, color:'#5c587a', margin:0}}>Say hi to {dataUser?.name || 'your contact'} 👋</p>
          </div>
        )}

        <div style={{display:'flex', flexDirection:'column', gap:3, maxWidth:680, margin:'0 auto', width:'100%'}}>
          {groupedMessages.map((item) => {
            if (item.type === 'date') {
              return (
                <div key={item.key} style={{display:'flex', alignItems:'center', gap:12, margin:'16px 0'}}>
                  <div style={{flex:1, height:1, background:'#1e1e28'}}/>
                  <span style={{fontSize:10.5, color:'#5c587a', fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase', fontFamily:'Syne, sans-serif', whiteSpace:'nowrap'}}>
                    {formatDate(item.date)}
                  </span>
                  <div style={{flex:1, height:1, background:'#1e1e28'}}/>
                </div>
              )
            }

            const isMine = user._id === item?.msgByUserId
            const prev = groupedMessages[groupedMessages.indexOf(item) - 1]
            const consec = prev && prev.type === 'msg' && prev.msgByUserId === item.msgByUserId

            return (
              <div
                key={item._id || item.key}
                className='msg-bubble'
                style={{display:'flex', alignItems:'flex-end', gap:9, justifyContent: isMine ? 'flex-end' : 'flex-start', marginBottom: consec ? 3 : 14}}
              >
                {!isMine && (
                  <div style={{flexShrink:0, opacity: consec ? 0 : 1, transition:'opacity 0.15s'}}>
                    <Avatar width={30} height={30} imageUrl={dataUser?.profile_pic} name={dataUser?.name} userId={dataUser?._id} />
                  </div>
                )}

                <div style={{maxWidth:'62%', position:'relative', display:'flex', flexDirection:'column', alignItems: isMine ? 'flex-end' : 'flex-start'}}>
                  <div style={{
                    padding:'10px 14px',
                    borderRadius:18,
                    background: isMine ? 'linear-gradient(135deg, #7c6af7dd, #7c6af799)' : '#18181f',
                    borderBottomRightRadius: isMine ? (consec ? 18 : 5) : 18,
                    borderBottomLeftRadius: !isMine ? (consec ? 18 : 5) : 18,
                    boxShadow: isMine ? '0 4px 20px rgba(124,106,247,0.35)' : 'none',
                  }}>
                    {item?.imageUrl && (
                      <img src={item.imageUrl} alt='img' style={{borderRadius:10, maxWidth:'100%', maxHeight:220, objectFit:'cover', display:'block', marginBottom: item.text ? 8 : 0, cursor:'pointer'}}
                        onClick={() => window.open(item.imageUrl, '_blank')} />
                    )}
                    {item?.videoUrl && (
                      <video src={item.videoUrl} style={{borderRadius:10, maxWidth:'100%', maxHeight:220, display:'block', marginBottom: item.text ? 8 : 0}} controls />
                    )}
                    {item.text && (
                      <p style={{fontSize:14, lineHeight:1.55, wordBreak:'break-word', color: isMine ? '#fff' : '#f0eeff', margin:0}}>{item.text}</p>
                    )}
                    <div style={{display:'flex', alignItems:'center', justifyContent:'flex-end', gap:4, marginTop:5}}>
                      <span style={{fontSize:10.5, color: isMine ? 'rgba(255,255,255,0.55)' : '#5c587a', whiteSpace:'nowrap'}}>
                        {moment(item.createdAt).format('h:mm A')}
                      </span>
                      {isMine && <BsCheck2All size={13} style={{color:'rgba(255,255,255,0.55)'}} />}
                    </div>
                  </div>
                </div>

                {isMine && (
                  <div style={{flexShrink:0, opacity: consec ? 0 : 1, transition:'opacity 0.15s'}}>
                    <Avatar width={30} height={30} imageUrl={user?.profile_pic} name={user?.name} userId={user?._id} />
                  </div>
                )}
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        {loading && (
          <div style={{position:'fixed', bottom:96, left:'50%', transform:'translateX(-50%)', zIndex:20, background:'#111118', border:'1px solid #2a2a35', borderRadius:12, padding:'10px 18px', display:'flex', alignItems:'center', gap:8, boxShadow:'0 8px 32px rgba(0,0,0,0.5)'}}>
            <Loading />
            <span style={{fontSize:12, color:'#9994b8'}}>Uploading...</span>
          </div>
        )}
      </section>

      {/* Media Preview */}
      {(message.imageUrl || message.videoUrl) && (
        <div style={{flexShrink:0, background:'#111118', borderTop:'1px solid #1e1e28', padding:'12px 20px'}}>
          <div style={{display:'flex', alignItems:'center', gap:12, maxWidth:680, margin:'0 auto'}}>
            <div style={{position:'relative', display:'inline-block'}}>
              {message.imageUrl && <img src={message.imageUrl} alt='preview' style={{width:72, height:72, objectFit:'cover', borderRadius:10, border:'1px solid #2a2a35'}} />}
              {message.videoUrl && <video src={message.videoUrl} style={{width:72, height:72, objectFit:'cover', borderRadius:10, border:'1px solid #2a2a35'}} />}
              <button onClick={() => setMessage(p => ({ ...p, imageUrl:'', videoUrl:'' }))}
                style={{position:'absolute', top:-6, right:-6, width:18, height:18, background:'#2a2a35', color:'#f0eeff', borderRadius:'50%', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}>
                <IoClose size={10} />
              </button>
            </div>
            <p style={{fontSize:12, color:'#5c587a'}}>{message.imageUrl ? 'Image ready to send' : 'Video ready to send'}</p>
          </div>
        </div>
      )}

      {/* Input Bar */}
      <div style={{flexShrink:0, padding:'14px 20px 18px', borderTop:'1px solid #1e1e28', position:'relative'}}>
        {/* Emoji Picker */}
        {showEmoji && (
          <div style={{position:'absolute', bottom:'calc(100% - 6px)', left:20, background:'#111118', border:'1px solid #2a2a35', borderRadius:14, padding:'10px 12px', display:'flex', flexWrap:'wrap', gap:4, width:220, boxShadow:'0 8px 32px rgba(0,0,0,0.5)', zIndex:20}}>
            {EMOJIS.map(em => (
              <button key={em} onClick={() => { setMessage(p => ({...p, text: p.text + em})); setShowEmoji(false); inputRef.current?.focus() }}
                style={{background:'none', border:'none', fontSize:22, cursor:'pointer', padding:4, borderRadius:8, lineHeight:1.2}}>
                {em}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSendMessage}>
          <div style={{
            display:'flex', alignItems:'center', gap:6,
            background:'#111118',
            border:`1.5px solid ${inputFocused ? '#7c6af7' : '#2a2a35'}`,
            borderRadius:16, padding:'8px 8px 8px 12px',
            transition:'border-color 0.2s, box-shadow 0.2s',
            boxShadow: inputFocused ? '0 0 0 3px rgba(124,106,247,0.2)' : 'none',
            maxWidth:680, margin:'0 auto',
          }}>
            {/* Attach */}
            <div ref={attachMenuRef} style={{position:'relative', flexShrink:0}}>
              <button type='button' onClick={() => setOpenAttachMenu(p => !p)}
                style={iconBtnStyle} title='Attach'
                onMouseEnter={e => e.currentTarget.style.color='#a594f9'}
                onMouseLeave={e => e.currentTarget.style.color='#5c587a'}
              >
                <MdAttachFile size={20} />
              </button>
              {openAttachMenu && (
                <div style={{position:'absolute', bottom:44, left:0, background:'#111118', border:'1px solid #2a2a35', borderRadius:16, overflow:'hidden', width:176, zIndex:30, boxShadow:'0 8px 32px rgba(0,0,0,0.5)'}}>
                  <p style={{padding:'12px 16px 6px', fontSize:10, fontFamily:'Syne, sans-serif', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#5c587a'}}>Attach</p>
                  <label htmlFor='uploadImage' style={{display:'flex', alignItems:'center', gap:10, padding:'10px 16px', cursor:'pointer', fontSize:13, color:'#9994b8', transition:'background 0.15s'}}
                    onMouseEnter={e => e.currentTarget.style.background='rgba(124,106,247,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}
                  >
                    <div style={{width:32, height:32, borderRadius:'50%', background:'rgba(124,106,247,0.15)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
                      <FaImage size={14} style={{color:'#a594f9'}} />
                    </div>
                    Image
                  </label>
                  <label htmlFor='uploadVideo' style={{display:'flex', alignItems:'center', gap:10, padding:'10px 16px', cursor:'pointer', fontSize:13, color:'#9994b8', borderTop:'1px solid #1e1e28', transition:'background 0.15s'}}
                    onMouseEnter={e => e.currentTarget.style.background='rgba(124,106,247,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}
                  >
                    <div style={{width:32, height:32, borderRadius:'50%', background:'rgba(124,106,247,0.15)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
                      <FaVideo size={14} style={{color:'#a594f9'}} />
                    </div>
                    Video
                  </label>
                  <input type='file' id='uploadImage' onChange={handleUploadImage} className='hidden' accept='image/*' />
                  <input type='file' id='uploadVideo' onChange={handleUploadVideo} className='hidden' accept='video/*' />
                </div>
              )}
            </div>

            {/* Emoji */}
            <button type='button' onClick={() => setShowEmoji(s => !s)}
              style={{...iconBtnStyle, color: showEmoji ? '#a594f9' : '#5c587a'}} title='Emoji'
              onMouseEnter={e => e.currentTarget.style.color='#a594f9'}
              onMouseLeave={e => { if (!showEmoji) e.currentTarget.style.color='#5c587a' }}
            >
              <MdOutlineEmojiEmotions size={21} />
            </button>

            {/* Input */}
            <input
              ref={inputRef}
              type='text'
              placeholder='Type a message…'
              style={{flex:1, background:'none', border:'none', outline:'none', color:'#f0eeff', fontSize:14, fontFamily:'DM Sans, sans-serif', lineHeight:1.5, padding:'2px 0'}}
              value={message.text}
              onChange={e => setMessage(p => ({ ...p, text: e.target.value }))}
              onKeyDown={handleKeyDown}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              autoComplete='off'
            />

            {/* Send / Mic */}
            {(message.text.trim() || message.imageUrl || message.videoUrl) ? (
              <button type='submit'
                style={{width:38, height:38, borderRadius:12, background:'linear-gradient(135deg, #7c6af7, #a594f9)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 4px 16px rgba(124,106,247,0.4)'}}
              >
                <IoMdSend size={17} style={{color:'#fff', transform:'translateX(1px)'}} />
              </button>
            ) : (
              <button type='button' style={iconBtnStyle} title='Voice message'
                onMouseEnter={e => e.currentTarget.style.color='#a594f9'}
                onMouseLeave={e => e.currentTarget.style.color='#5c587a'}
              >
                <BsMicFill size={16} />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default MessagePage
