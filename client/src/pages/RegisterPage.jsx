import React, { useState } from 'react'
import { IoClose } from "react-icons/io5";
import { Link, useNavigate } from 'react-router-dom';
import uploadFile from '../helpers/uploadFile';
import axios from 'axios'
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [data,setData] = useState({
    name : "",
    email : "",
    password : "",
    profile_pic : ""
  })
  const [uploadPhoto,setUploadPhoto] = useState("")
  const navigate = useNavigate()

  const handleOnChange = (e)=>{
    const { name, value} = e.target

    setData((preve)=>{
      return{
          ...preve,
          [name] : value
      }
    })
  }

  const handleUploadPhoto = async(e)=>{
    const file = e.target.files[0]
    
    if(!file) return
    
    console.log('Selected file:', file)
    setUploadPhoto(file)

    try {
      const uploadResult = await uploadFile(file)
      console.log('Upload result:', uploadResult)
      
      if(uploadResult?.url) {
        setData((preve)=>{
          return{
            ...preve,
            profile_pic : uploadResult.url
          }
        })
        toast.success('Photo uploaded successfully!')
      } else {
        toast.error('Failed to upload photo')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Error uploading photo')
      setUploadPhoto(null)
    }
  }
  const handleClearUploadPhoto = (e)=>{
    e.stopPropagation()
    e.preventDefault()
    setUploadPhoto(null)
    setData((preve)=>{
      return{
        ...preve,
        profile_pic : ""
      }
    })
  }

  const handleSubmit = async(e)=>{
    e.preventDefault()
    e.stopPropagation()

   
    const URL = `${import.meta.env.VITE_BACKEND_URL}/api/register`

    try {
        const response = await axios.post(URL,data)
        console.log("response",response)

        toast.success(response.data.message)

        if(response.data.success){
            setData({
              name : "",
              email : "",
              password : "",
              profile_pic : ""
            })

            navigate('/email')

        }
    } catch (error) {
        toast.error(error?.response?.data?.message)
    }
    console.log('data',data)
  }


  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4'>
        <div className='bg-white w-full max-w-md rounded-lg shadow-lg overflow-hidden p-6 mx-auto'>
          <h3 className='text-2xl font-bold text-gray-800 text-center mb-2'>Welcome to Chat App!</h3>
          <p className='text-gray-600 text-center mb-6'>Create your account to get started</p>

          <form className='grid gap-4 mt-5' onSubmit={handleSubmit}>
              <div className='flex flex-col gap-2'>
                <label htmlFor='name' className='text-gray-700 font-medium'>Name :</label>
                <input
                  type='text'
                  id='name'
                  name='name'
                  placeholder='Enter your name' 
                  className='bg-gray-50 border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  value={data.name}
                  onChange={handleOnChange}
                  required
                />
              </div>

              <div className='flex flex-col gap-2'>
                <label htmlFor='email' className='text-gray-700 font-medium'>Email :</label>
                <input
                  type='email'
                  id='email'
                  name='email'
                  placeholder='Enter your email' 
                  className='bg-gray-50 border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  value={data.email}
                  onChange={handleOnChange}
                  required
                />
              </div>

              <div className='flex flex-col gap-2'>
                <label htmlFor='password' className='text-gray-700 font-medium'>Password :</label>
                <input
                  type='password'
                  id='password'
                  name='password'
                  placeholder='Enter your password' 
                  className='bg-gray-50 border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  value={data.password}
                  onChange={handleOnChange}
                  required
                />
              </div>

              <div className='flex flex-col gap-2'>
                <label htmlFor='profile_pic' className='text-gray-700 font-medium'>Photo :</label>

                <label htmlFor='profile_pic' className='h-16 bg-gray-50 border-2 border-dashed border-gray-300 flex justify-center items-center rounded-md hover:border-blue-400 cursor-pointer transition-colors'>
                      <p className='text-sm max-w-[300px] text-ellipsis line-clamp-1 text-gray-600'>
                        {
                          uploadPhoto?.name ? uploadPhoto?.name : "Upload profile photo"
                        }
                      </p>
                      {
                        uploadPhoto?.name && (
                          <button 
                            type='button'
                            className='text-lg ml-2 text-gray-500 hover:text-red-500 transition-colors' 
                            onClick={handleClearUploadPhoto}
                          >
                            <IoClose/>
                          </button>
                        )
                      }
                </label>
                
                <input
                  type='file'
                  id='profile_pic'
                  name='profile_pic'
                  className='hidden'
                  onChange={handleUploadPhoto}
                  accept='image/*'
                />
              </div>


              <button
               type='submit'
               className='bg-blue-600 hover:bg-blue-700 text-white text-lg px-4 py-3 rounded-md mt-4 font-semibold transition-colors duration-200 shadow-md hover:shadow-lg'
              >
                Register
              </button>

          </form>

          <p className='my-4 text-center text-gray-600'>
            Already have an account? 
            <Link to={"/email"} className='text-blue-600 hover:text-blue-800 font-semibold ml-1 transition-colors'>
              Login
            </Link>
          </p>
        </div>
    </div>
  )
}

export default RegisterPage