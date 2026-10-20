import { Navigate, Route, Routes } from 'react-router-dom'

import Cadastro from './pages/Cadastro.jsx'
import EditarPerfil from './pages/EditarPerfil.jsx'
import EsqueciSenha from './pages/EsqueciSenha.jsx'
import Explorar from './pages/Explorar.jsx'
import GerenciarFavoritos from './pages/GerenciarFavoritos.jsx'
import Inicio from './pages/Inicio.jsx'
import Login from './pages/Login.jsx'
import NovaAvaliacao from './pages/NovaAvaliacao.jsx'
import Perfil, { MeuPerfil } from './pages/Perfil.jsx'
import Preferencias from './pages/Preferencias.jsx'
import RedefinirSenha from './pages/RedefinirSenha.jsx'
import Restaurante from './pages/Restaurante.jsx'

// Mapa de telas do site
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Inicio />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/esqueci-senha" element={<EsqueciSenha />} />
      <Route path="/redefinir-senha" element={<RedefinirSenha />} />
      <Route path="/preferencias" element={<Preferencias />} />
      <Route path="/explorar" element={<Explorar />} />
      <Route path="/restaurantes/:id" element={<Restaurante />} />
      <Route path="/restaurantes/:id/avaliar" element={<NovaAvaliacao />} />
      <Route path="/novo-post" element={<NovaAvaliacao />} />
      <Route path="/perfil" element={<MeuPerfil />} />
      <Route path="/perfil/editar" element={<EditarPerfil />} />
      <Route path="/perfil/favoritos" element={<GerenciarFavoritos />} />
      <Route path="/perfil/:username" element={<Perfil />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}