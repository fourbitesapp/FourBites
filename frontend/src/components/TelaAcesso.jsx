import { Link } from 'react-router-dom'

import mascote from '../assets/mascote.webp'
import IconeCozinha from './IconeCozinha.jsx'
import Logo from './Logo.jsx'

// Etiquetas de cozinha que enfeitam o painel (desenhos e cores de utils/cozinhas.js).
// No celular só aparecem as 6 primeiras (estilos.css).
const ETIQUETAS = [
  { nome: 'Japonesa', cor: '#ffb8c8' },
  { nome: 'Italiana', cor: '#b5dcf8' },
  { nome: 'Brasileira', cor: '#a8e2c2' },
  { nome: 'Pizzaria', cor: '#ffc193' },
  { nome: 'Hambúrguer', cor: '#ffd98a' },
  { nome: 'Cafeteria', cor: '#d8c4f5' },
  { nome: 'Mexicana', cor: '#d9eda3' },
  { nome: 'Doceria', cor: '#ffb8c8' },
  { nome: 'Árabe', cor: '#f6c6a8' },
  { nome: 'Frutos do mar', cor: '#9fe0dd' },
  { nome: 'Churrascaria', cor: '#ffc193' },
  { nome: 'Vegana', icone: 'vegana e vegetariana', cor: '#a8e2c2' },
]

// Molde das telas de acesso (entrar, criar conta, senha): painel amarelo à esquerda e o formulário à direita.
export default function TelaAcesso({ frase, titulo, children }) {
  return (
    <div className="fb-acesso">
      <aside className="fb-acesso-vitrine">
        <Link to="/" className="fb-marca"><Logo /> FourBites</Link>

        {/* enfeites: mascote no círculo vermelho e etiquetas de cozinhas */}
        <span className="fb-acesso-prato" aria-hidden="true">
          <span>
            <img src={mascote} alt="" className="fb-acesso-mascote" />
          </span>
        </span>
        <ul className="fb-acesso-etiquetas" aria-hidden="true">
          {ETIQUETAS.map((e) => (
            <li key={e.nome}>
              <span style={{ background: e.cor }}><IconeCozinha nome={e.nome} icone={e.icone} tamanho={22} /></span>
              {e.nome}
            </li>
          ))}
        </ul>

        <div className="fb-acesso-frase">
          <span className="fb-mao">{frase}</span>
          <h2>{titulo}</h2>
        </div>
      </aside>

      <main className="fb-acesso-formulario">{children}</main>
    </div>
  )
}

