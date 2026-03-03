import React from 'react'

const Loading = ({ size = 24, className = '' }) => (
  <div className={`flex items-center justify-center ${className}`}>
    <svg
      className='animate-spin'
      style={{ width: size, height: size }}
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <circle
        className='opacity-20'
        cx='12' cy='12' r='10'
        stroke='#7c6af7'
        strokeWidth='3'
      />
      <path
        d='M12 2a10 10 0 0 1 10 10'
        stroke='#7c6af7'
        strokeWidth='3'
        strokeLinecap='round'
      />
    </svg>
  </div>
)

export default Loading
