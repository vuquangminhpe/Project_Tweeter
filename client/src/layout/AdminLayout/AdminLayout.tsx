import { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const location = useLocation()

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const isActivePath = (path: string) => {
    return location.pathname.startsWith(path)
  }

  return (
    <div className='min-h-screen bg-gray-100 flex'>
      <motion.div
        className={`bg-gray-900 text-white transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64' : 'w-20'}`}
        initial={{ x: -10, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className='p-4 flex items-center justify-between'>
          <div className={`${isSidebarOpen ? 'block' : 'hidden'}`}>
            <h1 className='text-xl font-bold'>Admin Panel</h1>
          </div>
          <button onClick={toggleSidebar} className='p-2 rounded-md hover:bg-gray-800 focus:outline-none'>
            {isSidebarOpen ? (
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-6 w-6'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 19l-7-7 7-7m8 14l-7-7 7-7' />
              </svg>
            ) : (
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-6 w-6'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 5l7 7-7 7M5 5l7 7-7 7' />
              </svg>
            )}
          </button>
        </div>

        <div className='mt-5'>
          <nav className='px-2'>
            <Link
              to='/admin/dashboard'
              className={`flex items-center ${isActivePath('/admin/dashboard') ? 'bg-blue-700' : 'hover:bg-gray-800'} rounded-md p-3 mb-1 transition-colors`}
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-6 w-6'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z'
                />
              </svg>
              <span className={`ml-3 ${isSidebarOpen ? 'block' : 'hidden'}`}>Dashboard</span>
            </Link>

            <div className='mb-2'>
              <div
                className={`text-xs uppercase font-semibold text-gray-400 px-3 mt-5 mb-2 ${isSidebarOpen ? 'block' : 'hidden'}`}
              >
                Statistics
              </div>
              <Link
                to='/admin/statistics/users'
                className={`flex items-center ${isActivePath('/admin/statistics/users') ? 'bg-blue-700' : 'hover:bg-gray-800'} rounded-md p-3 mb-1 transition-colors`}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                  />
                </svg>
                <span className={`ml-3 ${isSidebarOpen ? 'block' : 'hidden'}`}>Users</span>
              </Link>
              <Link
                to='/admin/statistics/content'
                className={`flex items-center ${isActivePath('/admin/statistics/content') ? 'bg-blue-700' : 'hover:bg-gray-800'} rounded-md p-3 mb-1 transition-colors`}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
                  />
                </svg>
                <span className={`ml-3 ${isSidebarOpen ? 'block' : 'hidden'}`}>Content</span>
              </Link>
              <Link
                to='/admin/statistics/interactions'
                className={`flex items-center ${isActivePath('/admin/statistics/interactions') ? 'bg-blue-700' : 'hover:bg-gray-800'} rounded-md p-3 mb-1 transition-colors`}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
                  />
                </svg>
                <span className={`ml-3 ${isSidebarOpen ? 'block' : 'hidden'}`}>Interactions</span>
              </Link>
              <Link
                to='/admin/statistics/revenue'
                className={`flex items-center ${isActivePath('/admin/statistics/revenue') ? 'bg-blue-700' : 'hover:bg-gray-800'} rounded-md p-3 mb-1 transition-colors`}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
                <span className={`ml-3 ${isSidebarOpen ? 'block' : 'hidden'}`}>Revenue</span>
              </Link>
            </div>

            <div className='mb-2'>
              <div
                className={`text-xs uppercase font-semibold text-gray-400 px-3 mt-5 mb-2 ${isSidebarOpen ? 'block' : 'hidden'}`}
              >
                Management
              </div>
              <Link
                to='/admin/users'
                className={`flex items-center ${isActivePath('/admin/users') ? 'bg-blue-700' : 'hover:bg-gray-800'} rounded-md p-3 mb-1 transition-colors`}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'
                  />
                </svg>
                <span className={`ml-3 ${isSidebarOpen ? 'block' : 'hidden'}`}>User Management</span>
              </Link>
              <Link
                to='/admin/moderation/reported'
                className={`flex items-center ${isActivePath('/admin/moderation') ? 'bg-blue-700' : 'hover:bg-gray-800'} rounded-md p-3 mb-1 transition-colors`}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
                  />
                </svg>
                <span className={`ml-3 ${isSidebarOpen ? 'block' : 'hidden'}`}>Content Moderation</span>
              </Link>
              <Link
                to='/admin/reports/generate'
                className={`flex items-center ${isActivePath('/admin/reports') ? 'bg-blue-700' : 'hover:bg-gray-800'} rounded-md p-3 mb-1 transition-colors`}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                  />
                </svg>
                <span className={`ml-3 ${isSidebarOpen ? 'block' : 'hidden'}`}>Reports</span>
              </Link>
            </div>

            <div className='mb-2'>
              <div
                className={`text-xs uppercase font-semibold text-gray-400 px-3 mt-5 mb-2 ${isSidebarOpen ? 'block' : 'hidden'}`}
              >
                System
              </div>
              <Link to='/' className='flex items-center hover:bg-gray-800 rounded-md p-3 mb-1 transition-colors'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
                  />
                </svg>
                <span className={`ml-3 ${isSidebarOpen ? 'block' : 'hidden'}`}>Back to App</span>
              </Link>
            </div>
          </nav>
        </div>
      </motion.div>

      <div className='flex-1 flex flex-col overflow-hidden'>
        <header className='bg-white shadow-sm z-10'>
          <div className='px-4 py-3 flex justify-between items-center'>
            <div className='flex items-center'>
              <span className='text-lg font-semibold text-gray-800'>FlowFriend Admin</span>
            </div>
            <div className='flex items-center space-x-4'>
              <div className='relative'>
                <button className='p-1 rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-6 w-6'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'
                    />
                  </svg>
                </button>
              </div>
              <div className='flex items-center'>
                <span className='text-sm font-medium mr-2'>Admin</span>
                <img className='h-8 w-8 rounded-full' src='https://via.placeholder.com/32' alt='Admin' />
              </div>
            </div>
          </div>
        </header>

        <main className='flex-1 overflow-x-hidden overflow-y-auto bg-gray-100'>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
