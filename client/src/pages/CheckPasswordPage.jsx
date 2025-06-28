import React, { useEffect, useState } from 'react'
import { IoClose } from "react-icons/io5";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import uploadFile from '../helpers/uploadFile';
import axios from 'axios'
import toast from 'react-hot-toast';
import { PiUserCircle } from "react-icons/pi";
import Avatar from '../components/Avatar';
import { useDispatch } from 'react-redux';
import { setToken, setUser } from '../redux/userSlice';

const CheckPasswordPage = () => {
  const [data,setData] = useState({
    password : "",
    userId : ""
  })
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()

  useEffect(()=>{
    if(!location?.state?.name){
      navigate('/email')
    }
  },[])

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

    const URL = `${import.meta.env.VITE_BACKEND_URL}/api/password`

    try {
        const response = await axios({
          method :'post',
          url : URL,
          data : {
            userId : location?.state?._id,
            password : data.password
          },
          withCredentials : true
        })

        toast.success(response.data.message)

        if(response.data.success){
            dispatch(setToken(response?.data?.token))
            localStorage.setItem('token',response?.data?.token)

            setData({
              password : "",
            })
            navigate('/home')
        }
    } catch (error) {
        toast.error(error?.response?.data?.message)
    }
  }


  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4'>
        <div className='bg-white w-full max-w-md rounded-lg shadow-lg overflow-hidden p-6 mx-auto'>

            <div className='w-fit mx-auto mb-6 flex justify-center items-center flex-col'>
                <Avatar
                  width={70}
                  height={70}
                  name={location?.state?.name}
                  imageUrl={location?.state?.profile_pic}
                />
                <h2 className='font-semibold text-lg mt-2 text-gray-800'>{location?.state?.name}</h2>
                <p className='text-gray-600 text-center'>Enter your password to continue</p>
            </div>

          <form className='grid gap-4' onSubmit={handleSubmit}>
              
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

              <button
               className='bg-blue-600 hover:bg-blue-700 text-white text-lg px-4 py-3 rounded-md mt-4 font-semibold transition-colors duration-200 shadow-md hover:shadow-lg'
              >
                Login
              </button>

          </form>

          <p className='my-4 text-center'>
            <Link to={"/forgot-password"} className='text-blue-600 hover:text-blue-800 font-semibold transition-colors'>
              Forgot password?
            </Link>
          </p>
        </div>
    </div>
  )
}

export default CheckPasswordPage
