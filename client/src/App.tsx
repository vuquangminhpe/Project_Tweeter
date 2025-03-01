import './App.css'
import { ToastContainer } from 'react-toastify'
import { useContext, useEffect } from 'react'
import useRouteElement from './useRouteElement'
import { HelmetProvider } from 'react-helmet-async'
import { AppContext } from './Contexts/app.context'
import { localStorageEventTarget } from './utils/auth'
import ThemeProvider from './components/ThemeProvider'
import { Toaster } from 'sonner'

function App() {
  const { reset } = useContext(AppContext)

  useEffect(() => {
    localStorageEventTarget.addEventListener('clearLocalStorage', () => reset())

    return () => localStorageEventTarget.removeEventListener('clearLocalStorage', () => reset())
  }, [reset])
  const useRouterElement = useRouteElement()
  return (
    <HelmetProvider>
      <ThemeProvider defaultTheme='light' storageKey='vite-ui-theme'>
        {useRouterElement}
        <ToastContainer />
        {/* Use the default Toaster component without customization */}
        <Toaster />
      </ThemeProvider>
    </HelmetProvider>
  )
}

export default App
