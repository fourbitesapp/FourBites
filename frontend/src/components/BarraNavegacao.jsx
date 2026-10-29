import { useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '../contexts/AuthContext.jsx'
import Avatar from './Avatar.jsx'
import BotaoVoltar from './BotaoVoltar.jsx'
import Logo from './Logo.jsx'
import Notificacoes from './Notificacoes.jsx'

// Todos: Início e Explorar
// Usuário: perfil (foto ou iniciais), sino e sair
// Restaurante: meus restaurantes, sino, sair - Admin: painel admin e sair.

export default function BarraNavegacao() {
  const { usuario, logado, sair } = useAuth()
  const navegar = useNavigate()
  const { pathname } = useLocation()
  const [busca, setBusca] = useState('')

  const papel = logado ? usuario.papel : null
  const escrevendoAvaliacao = pathname === '/novo-post' || pathname.endsWith('/avaliar')

  function buscar(evento) {
    evento.preventDefault()
    const termo = busca.trim()
    navegar(termo ? `/explorar?busca=${encodeURIComponent(termo)}` : '/explorar')
  }

  function aoSair() {
    sair()
    navegar('/')
  }

  return (
    <>
      <header className="fb-barra">
        <div className="fb-barra-dentro">
          <div className="d-flex align-items-center gap-3">
            {pathname !== '/' && <BotaoVoltar />}
            <Link to="/" className="fb-marca"><Logo /> FourBites</Link>
          </div>

          <form className="fb-busca-barra" role="search" onSubmit={buscar}>
            <i className="bi bi-search" aria-hidden="true"></i>
            <input type="search" placeholder="Buscar restaurante, bairro ou pessoa" aria-label="Buscar"
              value={busca} onChange={(e) => setBusca(e.target.value)} />
          </form>

          <nav className="fb-nav" aria-label="Principal">
            <NavLink to="/" end className="fb-nav-link">Início</NavLink>
            <NavLink to="/explorar" className="fb-nav-link">Explorar</NavLink>

            {papel === 'USUARIO' && (
              <NavLink to="/perfil" className="fb-avatar-link" aria-label="Meu perfil" title="Meu perfil">
                <Avatar nome={usuario.nome} foto={usuario.fotoPerfil} tamanho="nav" />
              </NavLink>
            )}
            {papel === 'RESTAURANTE' && (
              <NavLink to="/meus-restaurantes" className="fb-icone-nav" aria-label="Meus restaurantes" title="Meus restaurantes">
                <i className="bi bi-shop" aria-hidden="true"></i>
              </NavLink>
            )}
            {papel === 'ADMIN' && (
              <NavLink to="/admin" className="fb-icone-nav" aria-label="Painel admin" title="Painel admin">
                <i className="bi bi-speedometer2" aria-hidden="true"></i>
              </NavLink>
            )}

            {(papel === 'USUARIO' || papel === 'RESTAURANTE') && <Notificacoes />}

            {logado && (
              <button type="button" className="fb-icone-nav" onClick={aoSair} aria-label="Sair" title="Sair">
                <i className="bi bi-box-arrow-right" aria-hidden="true"></i>
              </button>
            )}
            {!logado && <NavLink to="/login" className="fb-nav-link">Entrar</NavLink>}
          </nav>
        </div>
      </header>

      {/* Botão flutuante para publicar uma avaliação (só conta de usuário) */}
      {papel === 'USUARIO' && !escrevendoAvaliacao && (
        <Link to="/novo-post" className="fb-botao-flutuante" aria-label="Novo post">
          <i className="bi bi-plus-lg" aria-hidden="true"></i>
          <span className="fb-dica" aria-hidden="true">Novo post</span>
        </Link>
      )}
    </>
  )
}
