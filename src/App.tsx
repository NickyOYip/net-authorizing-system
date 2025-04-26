import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Broadcast from './pages/Broadcast'
import Public from './pages/Public'
import Private from './pages/Private'
import Verify from './pages/Verify'
import Layout from './components/Layout'
import PublicView from './pages/PublicView'
import PublicActivate from './pages/PublicActivate'
import NewContract from './pages/NewContract.jsx'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/broadcast" element={<Broadcast />} />
        <Route path="/public" element={<Public />} />
        <Route path="/view/:id" element={<PublicView />} />
        <Route path="/activate/:id" element={<PublicActivate />} />
        <Route path="/private" element={<Private />} />
        <Route path="/private/create" element={<NewContract contractType = {'private'}/>} />
        <Route path="/public/create" element={<NewContract contractType = {'public'}/>} />
        <Route path="/broadcast/create" element={<NewContract contractType = {'broadcast'}/>} />
        <Route path="/verify" element={<Verify />} />
      </Routes>
    </Layout>
  )
}