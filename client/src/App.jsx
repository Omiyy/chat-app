import './App.css'
import { Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

function App() {
  return (
    <>
      <Toaster
        position='top-center'
        toastOptions={{
          duration: 3000,
          style: {
            background: '#111118',
            color: '#f0eeff',
            fontSize: '13px',
            borderRadius: '12px',
            padding: '10px 16px',
            border: '1px solid #2a2a35',
          },
          success: { iconTheme: { primary: '#7c6af7', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#f87171', secondary: '#fff' } },
        }}
      />
      <Outlet />
    </>
  )
}

export default App