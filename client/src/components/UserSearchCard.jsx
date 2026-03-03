import React from 'react'
import Avatar from './Avatar'
import { Link } from 'react-router-dom'

const UserSearchCard = ({user, onClose}) => {
  return (
    <Link
      to={"/home/" + user?._id}
      onClick={onClose}
      style={{display:'flex', alignItems:'center', gap:12, padding:'10px 12px', borderRadius:12, textDecoration:'none', transition:'background 0.15s', cursor:'pointer'}}
      onMouseEnter={e => e.currentTarget.style.background='rgba(124,106,247,0.08)'}
      onMouseLeave={e => e.currentTarget.style.background='transparent'}
    >
      <Avatar
        width={44}
        height={44}
        name={user?.name}
        userId={user?._id}
        imageUrl={user?.profile_pic}
      />
      <div className='flex-1 min-w-0'>
        <p className='font-syne font-bold text-sm truncate' style={{color:'#f0eeff'}}>{user?.name}</p>
        <p className='text-xs truncate' style={{color:'#5c587a'}}>{user?.email}</p>
      </div>
    </Link>
  )
}

export default UserSearchCard
