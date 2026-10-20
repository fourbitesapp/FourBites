import { Link } from 'react-router-dom'

// Rodapé reto e claro, igual em todas as páginas.
export default function Rodape() {
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
            <Link to="/perfil">Perfil</Link>
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
