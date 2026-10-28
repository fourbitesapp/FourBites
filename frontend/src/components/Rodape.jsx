import { Link } from 'react-router-dom'

import { useAuth } from '../contexts/AuthContext.jsx'

// O terceiro link muda conforme o tipo de conta.
const AREA_DA_CONTA = {
  RESTAURANTE: ['/meus-restaurantes', 'Meus restaurantes'],
  ADMIN: ['/admin', 'Painel admin'],
}

// Rodapé reto e claro, igual em todas as páginas.
export default function Rodape() {
  const { usuario } = useAuth()
  const [caminho, nome] = AREA_DA_CONTA[usuario?.papel] || ['/perfil', 'Perfil']

  return (
    <footer className="fb-rodape">
      <div className="fb-rodape-dentro">
        <div className="d-flex flex-column gap-2" style={{ maxWidth: '24rem' }}>
          <strong style={{ fontSize: '1.9rem' }}>FourBites</strong>
          <span>Avaliações orgânicas de restaurantes, sem conteúdo patrocinado.</span>
          <span className="fb-mao" style={{ fontSize: '1.5rem' }}>feito com fome</span>
        </div>
        <nav className="d-flex flex-wrap gap-5" aria-label="Rodapé">
          <div className="d-flex flex-column gap-2">
            <strong>Navegar</strong>
            <Link to="/">Início</Link>
            <Link to="/explorar">Explorar</Link>
            <Link to={caminho}>{nome}</Link>
          </div>
          <div className="d-flex flex-column gap-2">
            <strong>Projeto</strong>
            <span>TCC · Sistemas para Internet</span>
            <span>Fatec Rubens Lara · 2026</span>
          </div>
        </nav>
      </div>
    </footer>
  )
}
