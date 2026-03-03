import React, { useEffect, useRef, useState } from 'react'
import Avatar from './Avatar'
import uploadFile from '../helpers/uploadFile'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useDispatch } from 'react-redux'
import { setUser } from '../redux/userSlice'
import { IoClose } from "react-icons/io5";
import { FaCamera } from "react-icons/fa";

const EditUserDetails = ({onClose, user}) => {
    const [data, setData] = useState({
        name: user?.name,
        profile_pic: user?.profile_pic
    })
    const [uploading, setUploading] = useState(false)
    const uploadPhotoRef = useRef()
    const dispatch = useDispatch()

    useEffect(() => {
        setData({ name: user?.name, profile_pic: user?.profile_pic })
    }, [user])

    const handleOnChange = (e) => {
        const { name, value } = e.target
        setData(prev => ({ ...prev, [name]: value }))
    }

    const handleUploadPhoto = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        setUploading(true)
        const uploadPhoto = await uploadFile(file)
        setUploading(false)
        setData(prev => ({ ...prev, profile_pic: uploadPhoto?.url }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        e.stopPropagation()
        try {
            const URL = `${import.meta.env.VITE_BACKEND_URL}/api/update-user`
            const response = await axios({
                method: 'post',
                url: URL,
                data: data,
                withCredentials: true
            })
            toast.success(response?.data?.message)
            if (response.data.success) {
                dispatch(setUser(response.data.data))
                onClose()
            }
        } catch (error) {
            toast.error('Failed to update profile')
        }
    }

    return (
        <div className='fixed inset-0 backdrop-blur-sm flex justify-center items-center z-50 p-4' style={{background:'rgba(0,0,0,0.7)'}}>
            <div className='rounded-2xl w-full max-w-sm overflow-hidden' style={{background:'#111118', border:'1px solid #2a2a35', boxShadow:'0 32px 80px rgba(0,0,0,0.6)'}}>
                {/* Header */}
                <div className='flex items-center justify-between px-5 py-4' style={{borderBottom:'1px solid #1e1e28'}}>
                    <div>
                        <h2 className='font-syne font-bold' style={{color:'#f0eeff'}}>Edit Profile</h2>
                        <p className='text-xs' style={{color:'#5c587a'}}>Update your name and photo</p>
                    </div>
                    <button onClick={onClose} className='p-1.5 rounded-lg' style={{color:'#5c587a', background:'transparent', border:'none', cursor:'pointer'}}>
                        <IoClose size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className='p-5 flex flex-col gap-5'>
                    {/* Avatar upload */}
                    <div className='flex flex-col items-center gap-3'>
                        <div className='relative'>
                            <Avatar
                                width={80}
                                height={80}
                                imageUrl={data?.profile_pic}
                                name={data?.name}
                                userId={user?._id}
                            />
                            <button
                                type='button'
                                onClick={() => uploadPhotoRef.current.click()}
                                style={{position:'absolute', bottom:-4, right:-4, width:28, height:28, background:'linear-gradient(135deg,#7c6af7,#a594f9)', color:'#fff', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 12px rgba(124,106,247,0.4)', border:'none', cursor:'pointer'}}
                                disabled={uploading}
                            >
                                <FaCamera size={12} />
                            </button>
                            <input
                                type='file'
                                ref={uploadPhotoRef}
                                className='hidden'
                                onChange={handleUploadPhoto}
                                accept='image/*'
                            />
                        </div>
                        {uploading && <p className='text-xs' style={{color:'#a594f9'}}>Uploading...</p>}
                    </div>

                    {/* Name field */}
                    <div className='flex flex-col gap-1.5'>
                        <label htmlFor='name' className='text-sm font-medium' style={{color:'#9994b8'}}>Display Name</label>
                        <input
                            type='text'
                            name='name'
                            id='name'
                            value={data.name}
                            onChange={handleOnChange}
                            style={{background:'#0a0a0f', border:'1px solid #2a2a35', borderRadius:10, padding:'10px 12px', fontSize:13, color:'#f0eeff', outline:'none', fontFamily:'DM Sans, sans-serif'}}
                            placeholder='Your name'
                        />
                    </div>

                    {/* Actions */}
                    <div className='flex gap-3 pt-1'>
                        <button
                            type='button'
                            onClick={onClose}
                            style={{flex:1, padding:'10px', borderRadius:10, border:'1px solid #2a2a35', color:'#9994b8', fontSize:13, fontWeight:600, background:'transparent', cursor:'pointer', fontFamily:'DM Sans, sans-serif'}}
                        >
                            Cancel
                        </button>
                        <button
                            type='submit'
                            style={{flex:1, padding:'10px', borderRadius:10, background:'linear-gradient(135deg,#7c6af7,#a594f9)', color:'#fff', fontSize:13, fontFamily:'Syne, sans-serif', fontWeight:700, border:'none', cursor:'pointer', boxShadow:'0 4px 16px rgba(124,106,247,0.35)'}}
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default React.memo(EditUserDetails)
