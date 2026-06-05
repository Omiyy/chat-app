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
            background: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            fontSize: '13px',
            borderRadius: '10px',
            padding: '10px 16px',
            border: '1px solid var(--border-primary)',
            boxShadow: 'var(--shadow-md)',
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