import { Link } from 'react-router-dom'

import { formatarData, formatarNota, iniciais } from '../utils/formatos.js'

const CATEGORIAS = [
  ['Comida', 'notaComida'],
  ['Atendimento', 'notaAtendimento'],
  ['Ambiente', 'notaAmbiente'],
  ['Custo-benefício', 'notaCusto'],
]

// Uma avaliação no visual do feed
export default function CartaoAvaliacao({ avaliacao }) {
  const a = avaliacao

  return (
    <article className="fb-cartao p-4 mb-3">
      <div className="d-flex gap-3 align-items-start">
        <span className="fb-avatar">{iniciais(a.usuario.nome)}</span>
        <div className="flex-grow-1">
          <strong className="fb-autor">{a.usuario.nome}</strong>
          <div className="fb-cartao-meta mt-0">
            avaliou{' '}
            <Link to={`/restaurantes/${a.restaurante.id}`} className="fb-link fw-semibold">{a.restaurante.nome}</Link>
            {' · '}{formatarData(a.dataAvaliacao)}{a.editada && ' · editada'}
          </div>
        </div>
        <div className="text-nowrap">
          <span className="fb-nota-avaliacao">{formatarNota(a.notaGeral, 2)}</span>
          <span className="fb-cartao-meta"> / 5</span>
        </div>
      </div>

      <div className="fb-notas-avaliacao row g-2 mt-3">
        {CATEGORIAS.map(([nome, campo]) => (
          <div key={campo} className="col-sm-6">
            <div className="d-flex justify-content-between"><span>{nome}</span><strong>{a[campo]}</strong></div>
            <div className="fb-barra-nota"><span style={{ width: `${(a[campo] / 5) * 100}%` }}></span></div>
          </div>
        ))}
      </div>

      {a.comentario && (
        <p className="mt-3 mb-0"><strong className="fb-autor">@{a.usuario.username}</strong> {a.comentario}</p>
      )}

      {a.fotos.length > 0 && (
        <div className="d-flex flex-wrap gap-2 mt-3">
          {a.fotos.map((url) => <img key={url} src={url} alt="" className="fb-foto-avaliacao" />)}
        </div>
      )}
    </article>
  )
}
