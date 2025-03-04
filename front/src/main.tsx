import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Test from './Test.tsx'
import Navbar from './Navbar.tsx'

const isMobile = window.matchMedia('(max-width: 767px)').matches


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/test" element={<Test />} />
        <Route path="/testa" element={<Test />} />
        <Route path="/testb" element={<Test />} />
        <Route path="*" element={<App />} />
      </Routes>
      <Navbar />
    </BrowserRouter>
  </StrictMode>
)
