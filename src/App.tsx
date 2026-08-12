import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import About from './pages/About'
import ConnectIndex from './pages/ConnectIndex'
import ConnectCrm from './pages/ConnectCrm'
import ConnectPage from './pages/ConnectPage'
import Pricing from './pages/Pricing'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/connect" element={<ConnectIndex />} />
        <Route path="/connect/crm" element={<ConnectCrm />} />
        <Route path="/connect/:slug" element={<ConnectPage />} />

        <Route path="/es" element={<Home />} />
        <Route path="/es/nosotros" element={<About />} />
        <Route path="/es/precios" element={<Pricing />} />
        <Route path="/es/conectar" element={<ConnectIndex />} />
        <Route path="/es/conectar/crm" element={<ConnectCrm />} />
        <Route path="/es/conectar/:slug" element={<ConnectPage />} />
      </Route>
    </Routes>
  )
}
