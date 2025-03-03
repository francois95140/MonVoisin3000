import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import PhoneAccueil from './phone/accueil/App.tsx'
import Test from './Test.tsx'
import Navbar from './Navbar.tsx'

const isMobile = window.matchMedia('(max-width: 767px)').matches

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {isMobile && <Route path="/" element={<><PhoneAccueil /><Navbar /></>} />}
        <Route path="/test" element={<><Test /><Navbar /></>} />
        <Route path="/navbar" element={<><PhoneAccueil /><Navbar /></>} />
        {/* <Route path="*" element={<PhoneAccueil />} /> */}
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)

