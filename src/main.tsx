import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { SecurityProvider } from './context/SecurityContext'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SecurityProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </SecurityProvider>
  </StrictMode>,
)
