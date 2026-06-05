import React from 'react'
import Avatar from './Avatar'
import { Link } from 'react-router-dom'

const UserSearchCard = ({ user, onClose }) => {
  return (
    <Link
      to={"/home/" + user?._id}
      onClick={onClose}
      className='flex items-center gap-3 p-2.5 rounded-lg no-underline transition-colors duration-150 hover:bg-[var(--bg-hover)]'
    >
      <Avatar
        width={42}
        height={42}
        name={user?.name}
        userId={user?._id}
        imageUrl={user?.profile_pic}
      />
      <div className='flex-1 min-w-0'>
        <p className='font-semibold text-sm truncate' style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
        <p className='text-xs truncate' style={{ color: 'var(--text-tertiary)' }}>{user?.email}</p>
      </div>
    </Link>
  )
}

export default React.memo(UserSearchCard)
