import { Link, NavLink, useNavigate } from 'react-router-dom'

import { useAuth } from '../contexts/AuthContext.jsx'

// Barra do topo, "entrar" ou "sair"
export default function BarraNavegacao() {
  const { usuario, logado, sair } = useAuth()
  const navegar = useNavigate()

  function aoSair() {
    sair()
    navegar('/')
  }

  return (
    <header className="fb-barra">
      <div className="container d-flex align-items-center justify-content-between gap-3">
        <Link to="/" className="fb-marca">
          <span className="fb-logo"><i className="bi bi-fork-knife" aria-hidden="true"></i></span>
          fourbites
        </Link>

        <nav className="d-flex align-items-center gap-2">
          <NavLink to="/" end className="fb-nav-link">
            <i className="bi bi-house" aria-hidden="true"></i> Início
          </NavLink>
          <NavLink to="/explorar" className="fb-nav-link">
            <i className="bi bi-compass" aria-hidden="true"></i> Explorar
          </NavLink>

          {logado ? (
            <>
              <span className="fb-nav-usuario d-none d-sm-inline">
                <i className="bi bi-person" aria-hidden="true"></i> {usuario.nome.split(' ')[0]}
              </span>
              <button type="button" className="fb-botao fb-botao-claro fb-botao-pequeno" onClick={aoSair}>
                Sair
              </button>
            </>
          ) : (
            <Link to="/login" className="fb-botao fb-botao-principal fb-botao-pequeno">
              Entrar
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
