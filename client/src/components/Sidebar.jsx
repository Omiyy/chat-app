import React, { useEffect, useState } from 'react'
import { FaUserPlus } from "react-icons/fa";
import { NavLink, useNavigate } from 'react-router-dom';
import { BiLogOut } from "react-icons/bi";
import { BsThreeDots, BsSunFill, BsMoonStarsFill } from "react-icons/bs";
import { useTheme } from '../context/ThemeContext';
import { IoSearchOutline } from "react-icons/io5";
import { MdOutlineEdit } from "react-icons/md";
import Avatar from './Avatar'
import { useDispatch, useSelector } from 'react-redux';
import EditUserDetails from './EditUserDetails';
import SearchUser from './SearchUser';
import { FaImage } from "react-icons/fa6";
import { FaVideo } from "react-icons/fa6";
import { logout } from '../redux/userSlice';
import moment from 'moment';

const Sidebar = () => {
    const user = useSelector(state => state?.user)
    const [editUserOpen, setEditUserOpen] = useState(false)
    const [allUser, setAllUser] = useState([])
    const [openSearchUser, setOpenSearchUser] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [showMenu, setShowMenu] = useState(false)
    const socketConnection = useSelector(state => state?.user?.socketConnection)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { isDark, toggleTheme } = useTheme()

    useEffect(() => {
        if (socketConnection) {
            socketConnection.emit('sidebar', user._id)
            socketConnection.on('conversation', (data) => {
                const conversationUserData = data.map((conversationUser) => {
                    if (conversationUser?.sender?._id === conversationUser?.receiver?._id) {
                        return { ...conversationUser, userDetails: conversationUser?.sender }
                    } else if (conversationUser?.receiver?._id !== user?._id) {
                        return { ...conversationUser, userDetails: conversationUser.receiver }
                    } else {
                        return { ...conversationUser, userDetails: conversationUser.sender }
                    }
                })
                setAllUser(conversationUserData)
            })
        }
    }, [socketConnection, user])

    const handleLogout = () => {
        dispatch(logout())
        navigate("/email")
        localStorage.clear()
    }

    const filteredUsers = allUser.filter(conv =>
        conv?.userDetails?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const formatTime = (dateStr) => {
        if (!dateStr) return ''
        const date = moment(dateStr)
        const now = moment()
        if (date.isSame(now, 'day')) return date.format('h:mm A')
        if (date.isSame(now.clone().subtract(1, 'day'), 'day')) return 'Yesterday'
        if (date.isSame(now, 'week')) return date.format('ddd')
        return date.format('MM/DD/YY')
    }

    const iconHover = {
        onMouseEnter: e => e.currentTarget.style.background='#1e1e28',
        onMouseLeave: e => e.currentTarget.style.background='transparent',
    }
    const menuItemHover = {
        onMouseEnter: e => { e.currentTarget.style.background='#1e1e28'; e.currentTarget.style.color='#f0eeff' },
        onMouseLeave: e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#9994b8' },
    }

    return (
        <div style={{width:'100%', height:'100%', display:'flex', flexDirection:'column', background:'#111118', borderRight:'1px solid #1e1e28'}}>

            {/* Brand + user row */}
            <div style={{flexShrink:0, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 16px', borderBottom:'1px solid #1e1e28'}}>
                <button onClick={() => setEditUserOpen(true)}
                    style={{display:'flex', alignItems:'center', gap:10, flex:1, minWidth:0, background:'none', border:'none', cursor:'pointer', padding:0}}
                    title='Edit profile'
                >
                    <div style={{flexShrink:0}}>
                        <Avatar width={38} height={38} name={user?.name} imageUrl={user?.profile_pic} userId={user?._id} />
                    </div>
                    <div style={{flex:1, minWidth:0, textAlign:'left'}}>
                        <p style={{fontFamily:'Syne, sans-serif', fontWeight:700, fontSize:13, color:'#f0eeff', letterSpacing:'-0.2px', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{user?.name}</p>
                        <p style={{fontSize:11, color:'#4ade80', margin:0, display:'flex', alignItems:'center', gap:4, marginTop:1}}>
                            <span style={{width:6, height:6, borderRadius:'50%', background:'#4ade80', display:'inline-block', flexShrink:0}}/>
                            Active now
                        </p>
                    </div>
                </button>
                <div style={{display:'flex', alignItems:'center', gap:2, flexShrink:0}}>
                    <button title={isDark ? 'Switch to light' : 'Switch to dark'} onClick={toggleTheme}
                        style={{width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:8, border:'none', cursor:'pointer', color: isDark ? '#a594f9' : '#7c3aed', background:'transparent', transition:'all 0.15s'}}
                        {...iconHover}
                    >
                        {isDark ? <BsSunFill size={15} /> : <BsMoonStarsFill size={15} />}
                    </button>
                    <button title='New chat' onClick={() => setOpenSearchUser(true)}
                        style={{width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:8, border:'none', cursor:'pointer', color:'#5c587a', background:'transparent', transition:'background 0.15s'}}
                        {...iconHover}
                    >
                        <MdOutlineEdit size={17} />
                    </button>
                    <div style={{position:'relative'}}>
                        <button title='Menu' onClick={() => setShowMenu(p => !p)}
                            style={{width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:8, border:'none', cursor:'pointer', color:'#5c587a', background:'transparent', transition:'background 0.15s'}}
                            {...iconHover}
                        >
                            <BsThreeDots size={16} />
                        </button>
                        {showMenu && (
                            <div style={{position:'absolute', right:0, top:36, background:'#18181f', border:'1px solid #2a2a35', borderRadius:12, overflow:'hidden', zIndex:50, width:176, boxShadow:'0 16px 48px rgba(0,0,0,0.6)'}}>
                                <button onClick={() => { setEditUserOpen(true); setShowMenu(false) }}
                                    style={{width:'100%', textAlign:'left', padding:'12px 16px', fontSize:13, color:'#9994b8', background:'transparent', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:10, transition:'all 0.15s'}}
                                    {...menuItemHover}
                                >
                                    <MdOutlineEdit size={14} style={{color:'#5c587a'}} /> Edit profile
                                </button>
                                <button onClick={() => { handleLogout(); setShowMenu(false) }}
                                    style={{width:'100%', textAlign:'left', padding:'12px 16px', fontSize:13, color:'#f87171', background:'transparent', border:'none', borderTop:'1px solid #2a2a35', cursor:'pointer', display:'flex', alignItems:'center', gap:10, transition:'all 0.15s'}}
                                    onMouseEnter={e => e.currentTarget.style.background='rgba(239,68,68,0.08)'}
                                    onMouseLeave={e => e.currentTarget.style.background='transparent'}
                                >
                                    <BiLogOut size={14} /> Sign out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Search */}
            <div style={{flexShrink:0, padding:'10px 12px', borderBottom:'1px solid #1e1e28'}}>
                <div style={{display:'flex', alignItems:'center', gap:8, background:'#18181f', border:'1px solid #2a2a35', borderRadius:10, padding:'8px 12px'}}>
                    <IoSearchOutline size={13} style={{color:'#5c587a', flexShrink:0}} />
                    <input
                        type='text'
                        placeholder='Search...'
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        style={{flex:1, background:'none', border:'none', outline:'none', color:'#f0eeff', fontSize:12.5, fontFamily:'DM Sans, sans-serif'}}
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} style={{color:'#5c587a', background:'none', border:'none', cursor:'pointer', fontSize:11, padding:0}}>✕</button>
                    )}
                </div>
            </div>

            {/* Section label */}
            <div style={{padding:'10px 18px 6px', flexShrink:0}}>
                <span style={{fontFamily:'Syne, sans-serif', fontSize:10, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#5c587a'}}>
                    {searchQuery ? 'Results' : 'Messages'}
                </span>
            </div>

            {/* Conversations */}
            <div className='sidebar-scroll' style={{flex:1, overflowY:'auto', overflowX:'hidden', padding:'0 8px 12px'}}>
                {filteredUsers.length === 0 && (
                    <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'60px 24px', textAlign:'center'}}>
                        <div style={{width:52, height:52, borderRadius:14, background:'rgba(124,106,247,0.12)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:12}}>
                            <FaUserPlus size={20} style={{color:'#7c6af7'}} />
                        </div>
                        <p style={{fontFamily:'Syne, sans-serif', fontWeight:700, fontSize:13, color:'#9994b8', margin:'0 0 4px'}}>
                            {searchQuery ? 'No results' : 'No conversations'}
                        </p>
                        <p style={{fontSize:11.5, color:'#5c587a', lineHeight:1.5, margin:0}}>
                            {searchQuery ? 'Nothing matching "' + searchQuery + '"' : 'Click the pencil icon to start a chat'}
                        </p>
                    </div>
                )}

                {filteredUsers.map((conv) => (
                    <NavLink
                        to={"/home/" + conv?.userDetails?._id}
                        key={conv?._id}
                        style={({ isActive }) => ({
                            display:'flex', alignItems:'center', gap:11,
                            padding:'9px 11px', borderRadius:12, marginBottom:2,
                            cursor:'pointer', textDecoration:'none',
                            borderLeft:`2.5px solid ${isActive ? '#7c6af7' : 'transparent'}`,
                            background: isActive ? 'rgba(124,106,247,0.13)' : 'transparent',
                            transition:'background 0.15s',
                        })}
                    >
                        <div style={{flexShrink:0}}>
                            <Avatar imageUrl={conv?.userDetails?.profile_pic} name={conv?.userDetails?.name} width={44} height={44} userId={conv?.userDetails?._id} />
                        </div>
                        <div style={{flex:1, minWidth:0}}>
                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:2}}>
                                <span style={{fontFamily:'Syne, sans-serif', fontWeight: Boolean(conv?.unseenMsg) ? 700 : 500, fontSize:13, color: Boolean(conv?.unseenMsg) ? '#f0eeff' : '#9994b8', letterSpacing:'-0.2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:120}}>
                                    {conv?.userDetails?.name}
                                </span>
                                <span style={{fontSize:10.5, color: Boolean(conv?.unseenMsg) ? '#a594f9' : '#5c587a', flexShrink:0, marginLeft:8, fontWeight: Boolean(conv?.unseenMsg) ? 600 : 400}}>
                                    {formatTime(conv?.lastMsg?.createdAt)}
                                </span>
                            </div>
                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:8}}>
                                <div style={{fontSize:12, color: Boolean(conv?.unseenMsg) ? '#c5c0e8' : '#5c587a', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:150, fontWeight: Boolean(conv?.unseenMsg) ? 500 : 400}}>
                                    {conv?.lastMsg?.imageUrl && !conv?.lastMsg?.text && <span>📷 Photo</span>}
                                    {conv?.lastMsg?.videoUrl && !conv?.lastMsg?.text && <span>🎥 Video</span>}
                                    {conv?.lastMsg?.text && conv?.lastMsg?.text}
                                    {!conv?.lastMsg?.text && !conv?.lastMsg?.imageUrl && !conv?.lastMsg?.videoUrl && <em style={{color:'#3a3a4a', fontSize:11}}>No messages yet</em>}
                                </div>
                                {Boolean(conv?.unseenMsg) && (
                                    <span style={{flexShrink:0, minWidth:20, height:20, display:'flex', justifyContent:'center', alignItems:'center', background:'#7c6af7', color:'#fff', fontSize:10, fontWeight:700, borderRadius:20, padding:'0 6px', fontFamily:'Syne, sans-serif'}}>
                                        {conv?.unseenMsg}
                                    </span>
                                )}
                            </div>
                        </div>
                    </NavLink>
                ))}
            </div>

            {/* New Chat */}
            <div style={{flexShrink:0, padding:12, borderTop:'1px solid #1e1e28'}}>
                <button
                    onClick={() => setOpenSearchUser(true)}
                    style={{width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:8, background:'linear-gradient(135deg, #7c6af7, #a594f9)', color:'#fff', fontSize:13, fontFamily:'Syne, sans-serif', fontWeight:700, borderRadius:12, padding:'11px 20px', border:'none', cursor:'pointer', boxShadow:'0 4px 20px rgba(124,106,247,0.35)', transition:'opacity 0.2s'}}
                >
                    <FaUserPlus size={14} />
                    New Conversation
                </button>
            </div>

            {editUserOpen && <EditUserDetails onClose={() => setEditUserOpen(false)} user={user} />}
            {openSearchUser && <SearchUser onClose={() => setOpenSearchUser(false)} />}
            {showMenu && <div style={{position:'fixed', inset:0, zIndex:40}} onClick={() => setShowMenu(false)} />}
        </div>
    )
}

export default Sidebar
