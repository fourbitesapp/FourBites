import { Link } from 'react-router-dom'

import { formatarData, formatarNota } from '../utils/formatos.js'
import Avatar from './Avatar.jsx'

const CATEGORIAS = [
  ['Comida', 'notaComida'],
  ['Ambiente', 'notaAmbiente'],
  ['Atendimento', 'notaAtendimento'],
  ['Custo-benefício', 'notaCusto'],
]

// Uma avaliação: autor, restaurante (no feed), nota geral, as 4 notas, comentário e fotos.
// No perfil do restaurante, mostrarRestaurante = false.
// "children" aparece no fim do cartão (o painel admin coloca ali o botão de excluir).
export default function CartaoAvaliacao({ avaliacao, mostrarRestaurante = true, destaque = false, children }) {
  const a = avaliacao

  return (
    <article className="fb-avaliacao" style={destaque ? { borderColor: '#ffb8c8' } : undefined}>
      <div className="d-flex gap-3 align-items-center">
        <Link to={`/perfil/${a.usuario.username}`}><Avatar nome={a.usuario.nome} foto={a.usuario.fotoPerfil} /></Link>
        <div className="flex-grow-1">
          <Link to={`/perfil/${a.usuario.username}`} className="fb-autor text-decoration-none">{a.usuario.nome}</Link>
          <div className="fb-cartao-meta mt-0">
            {mostrarRestaurante ? (
              <>avaliou <Link to={`/restaurantes/${a.restaurante.id}`} className="fb-link">{a.restaurante.nome}</Link> · </>
            ) : (
              <>@{a.usuario.username} · </>
            )}
            {formatarData(a.dataAvaliacao)}{a.editada && ' · editada'}
          </div>
        </div>
        <span className="fb-nota-avaliacao">{formatarNota(a.notaGeral, 2)}</span>
      </div>

      <div className="fb-notas-avaliacao">
        {CATEGORIAS.map(([nome, campo]) => (
          <div key={campo}>
            <span>{nome}</span>
            <strong>{a[campo]} <span className="d-inline" style={{ color: 'var(--fb-amarelo)' }}>★</span></strong>
          </div>
        ))}
      </div>

      {a.comentario && (
        <p className="mt-3 mb-0" style={{ color: 'var(--fb-tinta)' }}>
          {mostrarRestaurante && <strong>@{a.usuario.username} </strong>}{a.comentario}
        </p>
      )}

      {a.fotos.length > 0 && (
        <div className="d-flex flex-wrap gap-2 mt-3">
          {a.fotos.map((url) => <img key={url} src={url} alt="" className="fb-foto-avaliacao" />)}
        </div>
      )}

      {children}
    </article>
  )
}
