import React, { useEffect, useState } from 'react'
import { IoSearchOutline, IoClose } from "react-icons/io5";
import Loading from './Loading';
import UserSearchCard from './UserSearchCard';
import toast from 'react-hot-toast';
import api from '../helpers/axios';
import { useSelector } from 'react-redux';

const GroupModal = ({ onClose }) => {
    const [searchUser, setSearchUser] = useState([])
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState("")
    const [groupName, setGroupName] = useState("")
    const [selectedUsers, setSelectedUsers] = useState([])
    const socketConnection = useSelector(state => state?.user?.socketConnection)

    const handleSearchUser = async () => {
        const URL = `${import.meta.env.VITE_BACKEND_URL}/api/search-user`
        try {
            setLoading(true)
            const response = await api.post(URL, { search: search })
            setSearchUser(response.data.data)
        } catch (error) {
            toast.error(error?.response?.data?.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        handleSearchUser()
    }, [search])

    const toggleSelectUser = (user) => {
        const exists = selectedUsers.find(u => u._id === user._id)
        if (exists) {
            setSelectedUsers(selectedUsers.filter(u => u._id !== user._id))
        } else {
            setSelectedUsers([...selectedUsers, user])
        }
    }

    const handleCreateGroup = () => {
        if (!groupName.trim()) {
            toast.error("Please enter a group name")
            return
        }
        if (selectedUsers.length === 0) {
            toast.error("Please select at least one user")
            return
        }
        
        socketConnection.emit('create-group', {
            groupName: groupName,
            participants: selectedUsers.map(u => u._id)
        })
        
        toast.success("Group created!")
        onClose()
    }

    return (
        <div className='fixed top-0 bottom-0 left-0 right-0 z-50 p-4 flex items-center justify-center' style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
            <div className='w-full max-w-md rounded-2xl flex flex-col' style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-primary)', boxShadow: 'var(--shadow-xl)', maxHeight: '90vh' }}>
                
                {/* Header */}
                <div className='flex items-center justify-between px-5 py-4' style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <h2 className='text-[16px] font-bold' style={{ color: 'var(--text-primary)' }}>New Group</h2>
                    <button onClick={onClose} className='btn-icon' aria-label="Close modal">
                        <IoClose size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className='p-5 flex flex-col gap-4 overflow-y-auto' style={{ flex: 1 }}>
                    {/* Group Name Input */}
                    <div>
                        <label className='text-[13px] font-semibold mb-1 block' style={{ color: 'var(--text-secondary)' }}>Group Name</label>
                        <input 
                            type='text' 
                            placeholder='e.g. Project Team' 
                            className='w-full px-3 py-2 rounded-lg border outline-none'
                            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                        />
                    </div>

                    {/* Selected Users Chips */}
                    {selectedUsers.length > 0 && (
                        <div className='flex flex-wrap gap-2'>
                            {selectedUsers.map(u => (
                                <div key={u._id} className='flex items-center gap-1.5 px-2 py-1 rounded-md text-[12px]' style={{ background: 'var(--color-accent-soft)', color: 'var(--color-accent)' }}>
                                    {u.name}
                                    <IoClose className='cursor-pointer' onClick={() => toggleSelectUser(u)} />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Search Input */}
                    <div>
                        <label className='text-[13px] font-semibold mb-1 block' style={{ color: 'var(--text-secondary)' }}>Add Members</label>
                        <div className='flex items-center gap-2 rounded-lg px-3 py-2' style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
                            <IoSearchOutline size={16} style={{ color: 'var(--text-tertiary)' }} />
                            <input 
                                type='text'
                                placeholder='Search users by name or email...'
                                className='w-full outline-none bg-transparent text-[13px]'
                                style={{ color: 'var(--text-primary)' }}
                                onChange={(e) => setSearch(e.target.value)}
                                value={search}
                            />
                        </div>
                    </div>

                    {/* Search Results */}
                    <div className='flex flex-col gap-2 mt-2'>
                        {loading && (
                            <div className='flex justify-center py-4'>
                                <Loading size={24} />
                            </div>
                        )}
                        {!loading && searchUser.map((user) => {
                            const isSelected = selectedUsers.some(u => u._id === user._id)
                            return (
                                <div key={user._id} onClick={() => toggleSelectUser(user)} className={`cursor-pointer rounded-lg border transition-all ${isSelected ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)]' : 'border-transparent hover:border-[var(--border-primary)]'}`}>
                                    <UserSearchCard user={user} onClose={() => {}} />
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className='p-4 flex items-center justify-end gap-3' style={{ borderTop: '1px solid var(--border-subtle)' }}>
                    <button onClick={onClose} className='px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors' style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                        Cancel
                    </button>
                    <button onClick={handleCreateGroup} className='btn-primary px-5 py-2 rounded-lg text-[13px] font-semibold'>
                        Create Group
                    </button>
                </div>
            </div>
        </div>
    )
}

export default GroupModal
