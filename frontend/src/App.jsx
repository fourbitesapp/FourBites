import { Navigate, Route, Routes } from 'react-router-dom'

import Cadastro from './pages/Cadastro.jsx'
import Explorar from './pages/Explorar.jsx'
import Inicio from './pages/Inicio.jsx'
import Login from './pages/Login.jsx'
import NovaAvaliacao from './pages/NovaAvaliacao.jsx'
import Preferencias from './pages/Preferencias.jsx'
import Restaurante from './pages/Restaurante.jsx'

// Mapa de telas do site
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Inicio />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/preferencias" element={<Preferencias />} />
      <Route path="/explorar" element={<Explorar />} />
      <Route path="/restaurantes/:id" element={<Restaurante />} />
      <Route path="/restaurantes/:id/avaliar" element={<NovaAvaliacao />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}