import './App.css'
import { ToastContainer } from 'react-toastify'
import { useContext, useEffect } from 'react'
import useRouteElement from './useRouteElement'
import { HelmetProvider } from 'react-helmet-async'
import { ThemeProvider } from './components/ThemeProvider/theme-provider'
import { AppContext } from './Contexts/app.context'
import { localStorageEventTarget } from './utils/auth'
function App() {
  const { reset } = useContext(AppContext)

  useEffect(() => {
    localStorageEventTarget.addEventListener('clearLocalStorage', () => reset())

    return () => localStorageEventTarget.removeEventListener('clearLocalStorage', () => reset())
  }, [reset])
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
