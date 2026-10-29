import { Navigate, Route, Routes } from 'react-router-dom'

import VoltarAoTopo from './components/VoltarAoTopo.jsx'
import AdminAvaliacoes from './pages/admin/AdminAvaliacoes.jsx'
import AdminCadastros from './pages/admin/AdminCadastros.jsx'
import AdminCategorias from './pages/admin/AdminCategorias.jsx'
import AdminMudancas from './pages/admin/AdminMudancas.jsx'
import AdminRestaurantes from './pages/admin/AdminRestaurantes.jsx'
import Cadastro from './pages/Cadastro.jsx'
import EditarPerfil from './pages/EditarPerfil.jsx'
import EsqueciSenha from './pages/EsqueciSenha.jsx'
import Explorar from './pages/Explorar.jsx'
import FormularioRestaurante from './pages/FormularioRestaurante.jsx'
import GerenciarFavoritos from './pages/GerenciarFavoritos.jsx'
import Inicio from './pages/Inicio.jsx'
import Lista from './pages/Lista.jsx'
import ListaFormulario from './pages/ListaFormulario.jsx'
import Login from './pages/Login.jsx'
import MeusRestaurantes from './pages/MeusRestaurantes.jsx'
import NovaAvaliacao from './pages/NovaAvaliacao.jsx'
import Perfil, { MeuPerfil } from './pages/Perfil.jsx'
import Preferencias from './pages/Preferencias.jsx'
import RedefinirSenha from './pages/RedefinirSenha.jsx'
import Restaurante from './pages/Restaurante.jsx'

// Mapa de telas do site
export default function App() {
  return (
    <>
    <VoltarAoTopo />
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

      {/* Listas de restaurantes */}
      <Route path="/listas/nova" element={<ListaFormulario modo="nova" />} />
      <Route path="/listas/:id" element={<Lista />} />
      <Route path="/listas/:id/editar" element={<ListaFormulario modo="editar" />} />

      {/* Área do restaurante (conta RESTAURANTE) */}
      <Route path="/meus-restaurantes" element={<MeusRestaurantes />} />
      <Route path="/meus-restaurantes/novo" element={<FormularioRestaurante modo="novo" />} />
      <Route path="/meus-restaurantes/:id/editar" element={<FormularioRestaurante modo="editar" />} />

      {/* Painel do admin */}
      <Route path="/admin" element={<Navigate to="/admin/cadastros" replace />} />
      <Route path="/admin/cadastros" element={<AdminCadastros />} />
      <Route path="/admin/mudancas" element={<AdminMudancas />} />
      <Route path="/admin/restaurantes" element={<AdminRestaurantes />} />
      <Route path="/admin/restaurantes/novo" element={<FormularioRestaurante modo="admin" />} />
      <Route path="/admin/avaliacoes" element={<AdminAvaliacoes />} />
      <Route path="/admin/categorias" element={<AdminCategorias />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  )
}
