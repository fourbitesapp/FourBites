import { Link } from 'react-router-dom'

import Logo from './Logo.jsx'

// Molde das telas de acesso (entrar, criar conta, senha): painel vermelho à esquerda e o formulário à direita.
export default function TelaAcesso({ frase, titulo, children }) {
  return (
    <div className="fb-acesso">
      <aside className="fb-acesso-vitrine">
        <Link to="/" className="fb-marca"><Logo /> FourBites</Link>

        {/* enfeites */}
        <span className="fb-bolha" aria-hidden="true" style={{ right: '-60px', top: '120px', width: '300px', height: '300px', background: 'var(--fb-amarelo)' }}></span>
        <span className="fb-bolha d-flex align-items-center justify-content-center" aria-hidden="true"
          style={{ right: '30px', top: '170px', width: '220px', height: '220px', background: 'var(--fb-creme)', color: 'var(--fb-vermelho)' }}>
          <svg width="90" height="90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 11h18a9 7 0 0 1-18 0ZM7 8c1-2 2 0 3-2s2 0 3-2s2 0 3-2M17 3l2 8" />
          </svg>
        </span>
        <span className="fb-bolha" aria-hidden="true" style={{ left: '40px', top: '210px', width: '70px', height: '70px', background: '#ff8fa9' }}></span>

        <div>
          <span className="fb-mao">{frase}</span>
          <h2>{titulo}</h2>
        </div>
      </aside>

      <main className="fb-acesso-formulario">{children}</main>
    </div>
  )
}
