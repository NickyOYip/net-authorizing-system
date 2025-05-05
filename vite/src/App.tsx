import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Broadcast from './pages/Broadcast'
import Public from './pages/Public'
import Private from './pages/Private'
import Verify from './pages/Verify'
import Layout from './components/Layout'
import PublicView from './pages/PublicView'
import PublicActivate from './pages/PublicActivate'
import Activate from './pages/PublicActivate'
import CreateContract from './pages/Create'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contracts/:id" element={<PublicView />} />
        <Route path="/activate/:id" element={<PublicActivate />} />
        <Route path="/create" element={<CreateContract/>} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/activate" element={<Activate />} />
      </Routes>
    </Layout>
  )
}
