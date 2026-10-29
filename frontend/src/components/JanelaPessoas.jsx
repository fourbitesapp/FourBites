import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import Avatar from './Avatar.jsx'

// Janela com uma lista de pessoas (seguidores ou seguindo, no perfil; quem curtiu uma avaliação).

export default function JanelaPessoas({ titulo, carregar, vazio, aoFechar }) {
  const [pessoas, setPessoas] = useState(null)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    carregar().then(setPessoas).catch((falha) => setErro(falha.message))
    // carrega uma vez, ao abrir a janela
  }, [])

  useEffect(() => {
    function tecla(evento) {
      if (evento.key === 'Escape') aoFechar()
    }
    document.addEventListener('keydown', tecla)
    return () => document.removeEventListener('keydown', tecla)
  }, [aoFechar])

  return (
    <div className="fb-janela-fundo" role="presentation" onClick={aoFechar}>
      <div className="fb-janela" role="dialog" aria-modal="true" aria-labelledby="titulo-pessoas" onClick={(e) => e.stopPropagation()}>
        <div className="d-flex align-items-start gap-3 mb-3">
          <h2 id="titulo-pessoas" className="flex-grow-1 mb-0" style={{ fontSize: '1.6rem' }}>{titulo}</h2>
          <button type="button" className="fb-botao-texto fs-4 lh-1" onClick={aoFechar} aria-label="Fechar">
            <i className="bi bi-x" aria-hidden="true"></i>
          </button>
        </div>

        {erro && <p className="fb-erro-campo">{erro}</p>}
        {!erro && pessoas === null && <p className="fb-vazio py-4">Carregando…</p>}
        {pessoas?.length === 0 && <p className="fb-vazio py-4">{vazio}</p>}

        <div className="d-grid gap-2">
          {pessoas?.map((p) => (
            <Link key={p.id} to={`/perfil/${p.username}`} className="fb-pessoa" onClick={aoFechar}>
              <Avatar nome={p.nome} foto={p.fotoPerfil} />
              <span className="text-truncate">
                <strong className="d-block text-truncate">{p.nome}</strong>
                <span className="fb-cartao-meta">@{p.username}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
