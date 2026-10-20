import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'

import { useAuth } from '../contexts/AuthContext.jsx'
import Logo from './Logo.jsx'
import Notificacoes from './Notificacoes.jsx'

// Usuário: Início · Explorar · Novo post · Perfil e o sino de notificações. Restaurante e admin: Início · Explorar · Sair.
export default function BarraNavegacao() {
  const { usuario, logado, sair } = useAuth()
  const navegar = useNavigate()
  const [busca, setBusca] = useState('')

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
    <header className="fb-barra">
      <div className="fb-barra-dentro">
        <Link to="/" className="fb-marca"><Logo /> FourBites</Link>

        <form className="fb-busca-barra" role="search" onSubmit={buscar}>
          <i className="bi bi-search" aria-hidden="true"></i>
          <input type="search" placeholder="Buscar restaurante, bairro ou pessoa" aria-label="Buscar"
            value={busca} onChange={(e) => setBusca(e.target.value)} />
        </form>

        <nav className="fb-nav" aria-label="Principal">
          <NavLink to="/" end className="fb-nav-link">Início</NavLink>
          <NavLink to="/explorar" className="fb-nav-link">Explorar</NavLink>
          {logado && usuario.papel === 'USUARIO' && (
            <>
              <NavLink to="/novo-post" className="fb-nav-link">Novo post</NavLink>
              <NavLink to="/perfil" className="fb-nav-link">Perfil</NavLink>
              <Notificacoes />
            </>
          )}
          {logado && usuario.papel !== 'USUARIO' && (
            <button type="button" className="fb-nav-link fb-botao-texto" onClick={aoSair}>Sair</button>
          )}
          {!logado && <NavLink to="/login" className="fb-nav-link">Entrar</NavLink>}
        </nav>
      </div>
    </header>
  )
}


