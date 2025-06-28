import React, { useState } from 'react'
import { IoClose } from "react-icons/io5";
import { Link, useNavigate } from 'react-router-dom';
import uploadFile from '../helpers/uploadFile';
import axios from 'axios'
import toast from 'react-hot-toast';
import { PiUserCircle } from "react-icons/pi";

const CheckEmailPage = () => {
  const [data,setData] = useState({
    email : "",
  })
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

  const handleSubmit = async(e)=>{
    e.preventDefault()
    e.stopPropagation()

    const URL = `${import.meta.env.VITE_BACKEND_URL}/api/email`

    try {
        const response = await axios.post(URL,data)

        toast.success(response.data.message)

        if(response.data.success){
            setData({
              email : "",
            })
            navigate('/password',{
              state : response?.data?.data
            })
        }
    } catch (error) {
        toast.error(error?.response?.data?.message)
    }
  }


  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4'>
        <div className='bg-white w-full max-w-md rounded-lg shadow-lg overflow-hidden p-6 mx-auto'>

            <div className='w-fit mx-auto mb-6'>
                <PiUserCircle
                  size={80}
                  className='text-gray-400'
                />
            </div>

          <h3 className='text-2xl font-bold text-gray-800 text-center mb-2'>Welcome Back!</h3>
          <p className='text-gray-600 text-center mb-6'>Enter your email to continue</p>

          <form className='grid gap-4' onSubmit={handleSubmit}>
              
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

              <button
               className='bg-blue-600 hover:bg-blue-700 text-white text-lg px-4 py-3 rounded-md mt-4 font-semibold transition-colors duration-200 shadow-md hover:shadow-lg'
              >
                Next
              </button>

          </form>

          <p className='my-4 text-center text-gray-600'>
            New to Chat App? 
            <Link to={"/register"} className='text-blue-600 hover:text-blue-800 font-semibold ml-1 transition-colors'>
              Sign Up
            </Link>
          </p>
        </div>
    </div>
  )
}

export default CheckEmailPage