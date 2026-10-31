import { useState } from 'react'
import { Link } from 'react-router-dom'

import { formatarData, formatarNota } from '../utils/formatos.js'
import Avatar from './Avatar.jsx'
import Curtidas from './Curtidas.jsx'
import { VisorFotos } from './GaleriaFotos.jsx'
import SeloOficial from './SeloOficial.jsx'
import { foto } from '../utils/imagens.js'

const CATEGORIAS = [
  ['Comida', 'notaComida'],
  ['Ambiente', 'notaAmbiente'],
  ['Atendimento', 'notaAtendimento'],
  ['Custo-benefício', 'notaCusto'],
]

// Uma avaliação: autor, restaurante (no feed), nota geral, as 4 notas, comentário, fotos e curtidas.
// No perfil do restaurante, mostrarRestaurante = false.
// "children" aparece no fim do cartão (o painel admin coloca ali o botão de excluir).
export default function CartaoAvaliacao({ avaliacao, mostrarRestaurante = true, destaque = false, children }) {
  const a = avaliacao
  const [fotoAberta, setFotoAberta] = useState(null) // índice da foto aberta no visor, ou null

  return (
    <article className="fb-avaliacao" style={destaque ? { borderColor: '#ffb8c8' } : undefined}>
      <div className="d-flex gap-3 align-items-center">
        <Link to={`/perfil/${a.usuario.username}`}><Avatar nome={a.usuario.nome} foto={a.usuario.fotoPerfil} /></Link>
        <div className="flex-grow-1">
          <Link to={`/perfil/${a.usuario.username}`} className="fb-autor text-decoration-none">{a.usuario.nome}</Link>
          {a.usuario.oficial && <> <SeloOficial compacto /></>}
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
          {a.fotos.map((url, i) => (
            <button key={url} type="button" className="fb-foto-botao" onClick={() => setFotoAberta(i)}
              aria-label={`Ver foto ${i + 1} de ${a.fotos.length} em tamanho maior`}>
              <img src={foto(url, 320)} alt="" className="fb-foto-avaliacao" />
            </button>
          ))}
        </div>
      )}
      {fotoAberta !== null && (
        <VisorFotos fotos={a.fotos} inicio={fotoAberta} aoFechar={() => setFotoAberta(null)} />
      )}

      <Curtidas avaliacao={a} />

      {children}
    </article>
  )
}

