import axios from 'axios'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { logout, setOnlineUser, setSocketConnection, setUser } from '../redux/userSlice'
import Sidebar from '../components/Sidebar'
import logo from '../assets/logo.png'
import io from 'socket.io-client'

const Home = () => {
  const user = useSelector(state => state.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const fetchUserDetails = async()=>{
    try {
        const URL = `${import.meta.env.VITE_BACKEND_URL}/api/user-details`
        const response = await axios({
          url : URL,
          withCredentials : true
        })

        dispatch(setUser(response.data.data))

        if(response.data.data.logout){
            dispatch(logout())
            navigate("/email")
        }
    } catch (error) {
        console.error("fetchUserDetails error",error)
    }
  }

  useEffect(()=>{
    fetchUserDetails()
  },[])

  // Redirect to email if no token
  useEffect(()=>{
    const token = localStorage.getItem('token')
    if(!token){
      navigate('/email')
    }
  },[navigate])

  /***socket connection */
  useEffect(()=>{
    const socketConnection = io(import.meta.env.VITE_BACKEND_URL,{
      auth : {
        token : localStorage.getItem('token')
      },
    })

    socketConnection.on('onlineUser',(data)=>{
      dispatch(setOnlineUser(data))
    })

    dispatch(setSocketConnection(socketConnection))

    return ()=>{
      socketConnection.disconnect()
    }
  },[])


  const basePath = location.pathname === '/home'
  return (
    <div className='flex h-screen max-h-screen overflow-hidden' style={{background:'#0a0a0f'}}>

        {/* Sidebar — left vertical panel, hidden on mobile when chat is open */}
        <aside className={`flex-shrink-0 w-[300px] md:w-[320px] h-full overflow-hidden ${!basePath ? 'hidden md:flex md:flex-col' : 'flex flex-col w-full md:w-[320px]'}`} style={{background:'#111118', borderRight:'1px solid #1e1e28'}}>
           <Sidebar/>
        </aside>

        {/* Right panel — fills remaining space */}
        <section className={`flex-1 h-full overflow-hidden min-w-0 ${basePath ? 'hidden md:block' : 'block'}`}>
            {basePath ? (
                /* Empty state shown when no chat is selected */
                <div className='flex h-full items-center justify-center flex-col gap-4 relative overflow-hidden' style={{background:'#0a0a0f'}}>
                    <div className='absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl pointer-events-none' style={{background:'rgba(124,106,247,0.10)'}} />
                    <div className='absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full blur-2xl pointer-events-none' style={{background:'rgba(244,114,182,0.06)'}} />
                    <div className='relative flex flex-col items-center gap-4'>
                        <div className='w-20 h-20 rounded-2xl flex items-center justify-center rotate-3' style={{background:'linear-gradient(135deg, #7c6af7, #a594f9)', boxShadow:'0 8px 32px rgba(124,106,247,0.4)'}}>
                            <img src={logo} width={44} alt='logo' className='-rotate-3' />
                        </div>
                        <div className='text-center'>
                            <h2 className='text-2xl font-syne font-bold mb-2' style={{color:'#f0eeff', letterSpacing:'-0.5px'}}>Your messages</h2>
                            <p className='text-sm max-w-xs leading-relaxed' style={{color:'#5c587a'}}>
                                Select a conversation from the sidebar, or click
                                <span className='mx-1 font-semibold' style={{color:'#a594f9'}}>+</span>
                                to start a new chat
                            </p>
                        </div>
                        <div className='flex items-center gap-2 mt-2'>
                            <div className='w-2 h-2 rounded-full animate-bounce' style={{background:'rgba(124,106,247,0.5)', animationDelay:'0ms'}} />
                            <div className='w-2 h-2 rounded-full animate-bounce' style={{background:'#7c6af7', animationDelay:'150ms'}} />
                            <div className='w-2 h-2 rounded-full animate-bounce' style={{background:'rgba(124,106,247,0.5)', animationDelay:'300ms'}} />
                        </div>
                    </div>
                </div>
            ) : (
                <Outlet/>
            )}
        </section>

    </div>
  )
}

export default Home