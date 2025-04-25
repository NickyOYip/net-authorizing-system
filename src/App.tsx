import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Broadcast from './pages/Broadcast'
import Public from './pages/Public'
import Private from './pages/Private'
import Verify from './pages/Verify'
import Layout from './components/Layout'
import PublicView from './pages/PublicView'
import PublicActivate from './pages/PublicActivate'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/broadcast" element={<Broadcast />} />
        <Route path="/public" element={<Public />} />
        <Route path="/public/view/:id" element={<PublicView />} />
        <Route path="/public/activate/:id" element={<PublicActivate />} />
        <Route path="/private" element={<Private />} />
        <Route path="/verify" element={<Verify />} />
      </Routes>
    </Layout>
  )
}