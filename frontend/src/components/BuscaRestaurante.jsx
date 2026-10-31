import { useEffect, useState } from 'react'

import * as api from '../services/apiReal.js'
import { corDaCozinha } from '../utils/cozinhas.js'
import { formatarNota } from '../utils/formatos.js'
import IconeCozinha from './IconeCozinha.jsx'
import { foto } from '../utils/imagens.js'

// Campo de busca com sugestões enquanto digita (usa o GET /restaurantes?busca=...,
// que só devolve restaurantes aprovados e ativos).
export default function BuscaRestaurante({ aoEscolher }) {
  const [texto, setTexto] = useState('')
  const [sugestoes, setSugestoes] = useState([])
  const [buscando, setBuscando] = useState(false)

  useEffect(() => {
    if (texto.trim().length < 1) {
      setSugestoes([])
      return
    }
    let cancelada = false
    setBuscando(true)
    // Espera a pessoa parar de digitar por 300 ms antes de buscar.
    const espera = setTimeout(() => {
      api.buscarRestaurantes({ busca: texto.trim() })
        .then((lista) => !cancelada && setSugestoes(lista.slice(0, 6)))
        .catch(() => !cancelada && setSugestoes([]))
        .finally(() => !cancelada && setBuscando(false))
    }, 300)
    return () => {
      cancelada = true
      clearTimeout(espera)
    }
  }, [texto])

  return (
    <div className="fb-busca-restaurante">
      <div className="fb-campo">
        <i className="bi bi-search" aria-hidden="true"></i>
        <input type="search" placeholder="Busque pelo nome, categoria ou bairro" aria-label="Buscar restaurante"
          value={texto} onChange={(e) => setTexto(e.target.value)} autoFocus />
      </div>

      {texto.trim() && (
        <div className="fb-sugestoes" role="listbox">
          {sugestoes.map((r) => (
            <button key={r.id} type="button" role="option" aria-selected="false" className="fb-sugestao" onClick={() => aoEscolher(r)}>
              {r.fotoCapa ? <img src={foto(r.fotoCapa, 160)} alt="" /> : (
                <span className="fb-sem-foto" style={{ background: corDaCozinha(r.categoria) }}>
                  <IconeCozinha nome={r.categoria?.nome} icone={r.categoria?.icone} tamanho={24} />
                </span>
              )}
              <span className="flex-grow-1 text-start">
                <strong className="fb-autor d-block">{r.nome}</strong>
                <small className="fb-cartao-meta">{r.categoria?.nome} · {r.bairro}</small>
              </span>
              <span className="fb-nota">★ {formatarNota(r.notaMedia)}</span>
            </button>
          ))}
          {!buscando && sugestoes.length === 0 && <p className="fb-cartao-meta px-3 py-2 mb-0">Nenhum restaurante encontrado.</p>}
          <p className="fb-cartao-meta px-3 pb-2 mb-0">Mostrando apenas restaurantes aprovados.</p>
        </div>
      )}
    </div>
  )
}