import { useState } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { SplashScreen } from '../features/splash/SplashScreen'

export default function App() {
  const [splashDone, setSplashDone] = useState(false)

  return (
    <>
      {!splashDone && <SplashScreen onDone={() => setSplashDone(true)} />}
      <RouterProvider router={router} />
    </>
  )
}
