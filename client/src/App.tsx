import './App.css'
import { ToastContainer } from 'react-toastify'
import { useEffect } from 'react'
import axios from 'axios'
import useRouteElement from './useRouteElement'
import { HelmetProvider } from 'react-helmet-async'
import { ThemeProvider } from './components/ThemeProvider/theme-provider'
function App() {
  useEffect(() => {
    const controller = new AbortController()
    axios
      .get('/users/me', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        },
        baseURL: 'http://localhost:5000',
        signal: controller.signal
      })
      .then((res) => {
        localStorage.setItem('profile', JSON.stringify(res.data.result))
      })
      .catch((err) => console.log(err))
    return () => {
      controller.abort()
    }
  }, [])

  const useRouterElement = useRouteElement()
  return (
    <HelmetProvider>
      <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
        {useRouterElement}
        <ToastContainer />
      </ThemeProvider>
    </HelmetProvider>
  )
}

export default App
