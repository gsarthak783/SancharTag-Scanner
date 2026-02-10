import { Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/Landing';
import { LoginPage } from './pages/Login';
import { ContactPage } from './pages/Contact';
import { ChatPage } from './pages/Chat';
import { ReportPage } from './pages/Report';
import { EndSessionPage } from './pages/EndSession';
import { SocketProvider } from './context/SocketContext';

function App() {
  return (
    <SocketProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/scan/:id" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/end" element={<EndSessionPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </SocketProvider>
  )
}

export default App
