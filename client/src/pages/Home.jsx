import api from '../helpers/axios'
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

  const fetchUserDetails = async () => {
    try {
      const URL = `${import.meta.env.VITE_BACKEND_URL}/api/user-details`
      const response = await api.get(URL)

      dispatch(setUser(response.data.data))

      if (response.data.data.logout) {
        dispatch(logout())
        navigate("/email")
      }
    } catch (error) {
      console.error("fetchUserDetails error", error)
    }
  }

  useEffect(() => {
    fetchUserDetails()
  }, [])

  // Redirect to email if not authenticated (handled by axios interceptor on API failure)
  // Let fetchUserDetails manage the authentication state

  /***socket connection */
  useEffect(() => {
    const socketConnection = io(import.meta.env.VITE_BACKEND_URL, {
      withCredentials: true
    })

    socketConnection.on('onlineUser', (data) => {
      dispatch(setOnlineUser(data))
    })

    dispatch(setSocketConnection(socketConnection))

    return () => {
      socketConnection.disconnect()
    }
  }, [])

  const basePath = location.pathname === '/home'

  return (
    <div className='flex h-screen max-h-screen overflow-hidden' style={{ background: 'var(--bg-primary)' }}>

      {/* Sidebar — left vertical panel, hidden on mobile when chat is open */}
      <aside
        className={`flex-shrink-0 w-[300px] md:w-[320px] h-full overflow-hidden ${!basePath ? 'hidden md:flex md:flex-col' : 'flex flex-col w-full md:w-[320px]'}`}
        style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-primary)' }}
      >
        <Sidebar />
      </aside>

      {/* Right panel — fills remaining space */}
      <section className={`flex-1 h-full overflow-hidden min-w-0 ${basePath ? 'hidden md:block' : 'block'}`}>
        {basePath ? (
          /* Empty state shown when no chat is selected */
          <div className='flex h-full items-center justify-center flex-col gap-5 relative overflow-hidden' style={{ background: 'var(--bg-primary)' }}>
            {/* Decorative blurs */}
            <div className='absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-3xl pointer-events-none' style={{ background: 'rgba(124,106,247,0.06)' }} />
            <div className='absolute bottom-1/4 right-1/4 w-56 h-56 rounded-full blur-2xl pointer-events-none' style={{ background: 'rgba(244,114,182,0.04)' }} />

            <div className='relative flex flex-col items-center gap-5 animate-fade-in'>
              {/* Logo */}
              <div
                className='w-16 h-16 rounded-2xl flex items-center justify-center'
                style={{
                  background: 'var(--color-accent)',
                  boxShadow: '0 6px 24px var(--color-accent-glow)',
                }}
              >
                <img src={logo} width={36} alt='ChatApp logo' />
              </div>

              <div className='text-center'>
                <h2 className='text-2xl font-bold mb-2' style={{ color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
                  Your messages
                </h2>
                <p className='text-sm max-w-xs leading-relaxed' style={{ color: 'var(--text-tertiary)' }}>
                  Select a conversation from the sidebar or start a new one
                </p>
              </div>

              {/* Subtle animated dots */}
              <div className='flex items-center gap-2 mt-1'>
                <div className='w-1.5 h-1.5 rounded-full animate-bounce' style={{ background: 'rgba(124,106,247,0.4)', animationDelay: '0ms' }} />
                <div className='w-1.5 h-1.5 rounded-full animate-bounce' style={{ background: 'var(--color-accent)', animationDelay: '150ms' }} />
                <div className='w-1.5 h-1.5 rounded-full animate-bounce' style={{ background: 'rgba(124,106,247,0.4)', animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        ) : (
          <Outlet />
        )}
      </section>
    </div>
  )
}

export default Home