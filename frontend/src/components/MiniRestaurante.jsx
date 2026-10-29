import { corDaCozinha } from '../utils/cozinhas.js'
import IconeCozinha from './IconeCozinha.jsx'

// Quadradinho do restaurante nas listas do admin: a foto de capa ou, sem foto, o desenho da cozinha.
export default function MiniRestaurante({ restaurante, pequeno = false }) {
  const r = restaurante
  return (
    <span className={`fb-mini ${pequeno ? 'fb-mini-pequeno' : ''}`} aria-hidden="true"
      style={{ background: corDaCozinha(r.categoria) }}>
      {r.fotoCapa ? <img src={r.fotoCapa} alt="" /> : <IconeCozinha nome={r.categoria?.nome} icone={r.categoria?.icone} tamanho={26} />}
    </span>
  )
}
