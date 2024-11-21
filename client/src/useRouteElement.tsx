import { useContext } from 'react'
import { AppContext } from './Contexts/app.context'
import { Navigate, Outlet, useRoutes } from 'react-router-dom'
import path from './constants/path'
import RegisterLayout from './layout/RegisterLayout'
import Login from './pages/User/Login'
import Register from './pages/User/Register'
import MainLayout from './layout/MainLayout'
import UserLayout from './layout/UserLayout'
import Profile from './pages/User/Profile'
import ChangePassword from './pages/User/ChangePassword'
import Home from './Home'
import VerifyEmail from './pages/User/VerifyEmail'
import ForgotPassword from './pages/User/ForgotPassword'
import VerifyForgotToken from './pages/User/VerifyForgotToken'
import ResetPassword from './pages/User/ResetPassword'
import Chat from './pages/User/ChatUser'

function ProtectedRoute() {
  const { isAuthenticated } = useContext(AppContext)
  return isAuthenticated ? <Outlet /> : <Navigate to='/login' />
}
function RejectedRoute() {
  const { isAuthenticated } = useContext(AppContext)
  return !isAuthenticated ? <Outlet /> : <Navigate to='/' />
}

export default function useRouteElement() {
  const routeElements = useRoutes([
    {
      path: '/',
      element: <RejectedRoute />,
      children: [
        {
          path: path.login,
          element: (
            <RegisterLayout>
              <Login />
            </RegisterLayout>
          )
        },
        {
          path: path.register,
          element: (
            <RegisterLayout>
              <Register />
            </RegisterLayout>
          )
        }
      ]
    },
    {
      path: '',
      element: <ProtectedRoute />,
      children: [
        {
          path: 'users',
          element: (
            <MainLayout>
              <UserLayout />
            </MainLayout>
          ),
          children: [
            {
              path: path.profile,
              element: <Profile />
            },
            {
              path: path.changePassword,
              element: <ChangePassword />
            },
            {
              path: path.chat,
              element: <Chat />
            }
          ]
        }
      ]
    },
    {
      path: path.home,
      element: <Home />
    },
    {
      path: '/verify-email',
      element: <VerifyEmail />
    },
    {
      path: '/forgot_password',
      element: <ForgotPassword />
    },
    {
      path: '/verify-forgot-password',
      element: <VerifyForgotToken />
    },
    {
      path: '/reset-password',
      element: <ResetPassword />
    }
  ])
  return routeElements
}
