import React from 'react'
import { PiUserCircle } from "react-icons/pi";
import { useSelector } from 'react-redux';

const bgColors = [
  'bg-indigo-200 text-indigo-800',
  'bg-emerald-200 text-emerald-800',
  'bg-rose-200 text-rose-800',
  'bg-amber-200 text-amber-800',
  'bg-cyan-200 text-cyan-800',
  'bg-purple-200 text-purple-800',
  'bg-sky-200 text-sky-800',
  'bg-teal-200 text-teal-800',
  'bg-orange-200 text-orange-800',
]

// Deterministic color from name/userId string
const getColorIndex = (str) => {
  if (!str) return 0
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash) % bgColors.length
}

const Avatar = ({userId, name, imageUrl, width, height}) => {
    const onlineUser = useSelector(state => state?.user?.onlineUser)

    let avatarName = ""
    if (name) {
      const splitName = name.trim().split(" ")
      avatarName = splitName.length > 1
        ? (splitName[0][0] + splitName[1][0]).toUpperCase()
        : splitName[0][0].toUpperCase()
    }

    const colorClass = bgColors[getColorIndex(userId || name)]
    const isOnline = onlineUser?.includes(userId)
    const fontSize = width >= 50 ? '16px' : width >= 36 ? '13px' : '11px'

    return (
        <div
            className='rounded-full relative flex-shrink-0'
            style={{ width: width + 'px', height: height + 'px' }}
        >
            {imageUrl ? (
                <img
                    src={imageUrl}
                    width={width}
                    height={height}
                    alt={name}
                    className='rounded-full object-cover w-full h-full'
                />
            ) : name ? (
                <div
                    className={`rounded-full flex justify-center items-center font-bold ${colorClass}`}
                    style={{ width: width + 'px', height: height + 'px', fontSize }}
                >
                    {avatarName}
                </div>
            ) : (
                <PiUserCircle size={width} className='text-slate-400' />
            )}

            {isOnline && (
                <div className='absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full'></div>
            )}
        </div>
    )
}

export default Avatar
