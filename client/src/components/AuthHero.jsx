import React from 'react'

const BRAND_ICON = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="#7c6af7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const AuthHero = ({ title, subtitle, features = [] }) => (
  <div
    className='hidden lg:flex w-[42%] flex-col justify-between p-11 relative overflow-hidden'
    style={{ background: 'linear-gradient(135deg, #4a3ab5 0%, #7c6af7 50%, #5b4fd6 100%)' }}
  >
    {/* Decorative circles */}
    <div className='absolute -top-16 -left-16 w-64 h-64 rounded-full' style={{ background: 'rgba(255,255,255,0.05)' }} />
    <div className='absolute top-[35%] -right-20 w-72 h-72 rounded-full' style={{ background: 'rgba(167,139,250,0.15)' }} />
    <div className='absolute -bottom-12 left-[30%] w-48 h-48 rounded-full' style={{ background: 'rgba(196,181,253,0.12)' }} />

    <div className='relative'>
      {/* Brand */}
      <div className='flex items-center gap-3 mb-14'>
        <div className='w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-md'>
          {BRAND_ICON}
        </div>
        <span className='font-bold text-xl text-white tracking-tight'>ChatApp</span>
      </div>

      {/* Hero text */}
      <h1 className='text-4xl font-extrabold text-white leading-tight tracking-tight mb-4'>
        {title}
      </h1>
      {subtitle && (
        <p className='text-white/70 text-[15px] leading-relaxed max-w-[280px]'>
          {subtitle}
        </p>
      )}
    </div>

    {/* Feature list */}
    {features.length > 0 && (
      <div className='relative flex flex-col gap-3.5'>
        {features.map(f => (
          <div key={f} className='flex items-center gap-3'>
            <div className='w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0' style={{ background: 'rgba(255,255,255,0.18)' }}>
              <div className='w-2 h-2 rounded-full bg-white' />
            </div>
            <span className='text-white/85 text-sm'>{f}</span>
          </div>
        ))}
      </div>
    )}
  </div>
)

export default React.memo(AuthHero)
