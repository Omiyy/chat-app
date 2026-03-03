import React, { useEffect, useState } from 'react'
import { IoSearchOutline } from "react-icons/io5";
import Loading from './Loading';
import UserSearchCard from './UserSearchCard';
import toast from 'react-hot-toast'
import axios from 'axios';
import { IoClose } from "react-icons/io5";

const SearchUser = ({onClose}) => {
    const [searchUser,setSearchUser] = useState([])
    const [loading,setLoading] = useState(false)
    const [search,setSearch] = useState("")

    const handleSearchUser = async()=>{
        const URL = `${import.meta.env.VITE_BACKEND_URL}/api/search-user`
        try {
            setLoading(true)
            const response = await axios.post(URL,{ search })
            setLoading(false)
            setSearchUser(response.data.data)
        } catch (error) {
            setLoading(false)
            toast.error(error?.response?.data?.message || 'Search failed')
        }
    }

    useEffect(()=>{
        handleSearchUser()
    },[search])

    return (
        <div className='fixed inset-0 backdrop-blur-sm flex items-start justify-center pt-16 px-4 z-50' style={{background:'rgba(0,0,0,0.7)'}}>
            <div className='w-full max-w-md rounded-2xl overflow-hidden' style={{background:'#111118', border:'1px solid #2a2a35', boxShadow:'0 32px 80px rgba(0,0,0,0.6)'}}>
                {/* Search header */}
                <div className='flex items-center gap-3 px-4 py-3' style={{borderBottom:'1px solid #1e1e28'}}>
                    <IoSearchOutline size={18} style={{color:'#7c6af7', flexShrink:0}} />
                    <input
                        type='text'
                        placeholder='Search by name or email...'
                        style={{flex:1, outline:'none', background:'transparent', border:'none', color:'#f0eeff', fontSize:13, fontFamily:'DM Sans, sans-serif'}}
                        onChange={(e) => setSearch(e.target.value)}
                        value={search}
                        autoFocus
                    />
                    <button
                        onClick={onClose}
                        style={{padding:4, borderRadius:8, border:'none', cursor:'pointer', color:'#5c587a', background:'transparent'}}
                    >
                        <IoClose size={18} />
                    </button>
                </div>

                {/* Results */}
                <div className='max-h-[60vh] overflow-y-auto'>
                    {loading && (
                        <div className='flex justify-center items-center py-10'>
                            <Loading />
                        </div>
                    )}

                    {!loading && searchUser.length === 0 && (
                        <div className='flex flex-col items-center justify-center py-12 text-center px-4'>
                            <div className='w-12 h-12 rounded-full flex items-center justify-center mb-3' style={{background:'rgba(124,106,247,0.12)'}}>
                                <IoSearchOutline size={20} style={{color:'#7c6af7'}} />
                            </div>
                            <p className='font-syne font-bold text-sm' style={{color:'#9994b8'}}>No users found</p>
                            <p className='text-xs mt-1' style={{color:'#5c587a'}}>Try a different name or email</p>
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
