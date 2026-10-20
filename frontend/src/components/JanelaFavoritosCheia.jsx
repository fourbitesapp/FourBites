import { useState } from 'react'

// Janela que aparece ao favoritar o 5º restaurante: escolher qual dos 4 sai.
// O novo fica na mesma posição do que saiu.
export default function JanelaFavoritosCheia({ novo, favoritos, aoConfirmar, aoFechar, enviando }) {
  const [posicao, setPosicao] = useState(null)
  const escolhido = favoritos.find((f) => f.posicao === posicao)

  return (
    <div className="fb-janela-fundo" role="presentation" onClick={aoFechar}>
      <div className="fb-janela" role="dialog" aria-modal="true" aria-labelledby="titulo-favoritos-cheia"
        onClick={(e) => e.stopPropagation()}>
        <div className="d-flex gap-3 align-items-start mb-4">
          <div className="flex-grow-1">
            <span className="fb-mao" style={{ fontSize: '1.5rem' }}>eita, lotou!</span>
            <h2 id="titulo-favoritos-cheia" className="mt-1 mb-2" style={{ fontSize: '1.6rem' }}>Sua lista de favoritos está cheia</h2>
            <p className="fb-subtitulo mb-0">
              Escolha qual restaurante sai para dar lugar a <strong className="fb-autor">{novo.nome}</strong>. Ele fica na mesma posição.
            </p>
          </div>
          <button type="button" className="fb-botao-texto fs-4 lh-1" onClick={aoFechar} aria-label="Fechar">
            <i className="bi bi-x" aria-hidden="true"></i>
          </button>
        </div>

        <div className="fb-rotulo">Substituir</div>
        <div className="d-grid gap-2" role="radiogroup">
          {favoritos.map((f) => (
            <label key={f.posicao} className={`fb-opcao-substituir ${posicao === f.posicao ? 'ativo' : ''}`}>
              <input type="radio" name="substituir" checked={posicao === f.posicao} onChange={() => setPosicao(f.posicao)} />
              <span className="fb-numero" style={{ width: '1.9rem', height: '1.9rem', fontSize: '0.95rem' }}>{f.posicao}</span>
              <span>
                <strong className="fb-autor d-block">{f.restaurante.nome}</strong>
                <small className="fb-cartao-meta">{f.restaurante.categoria?.nome}</small>
              </span>
            </label>
          ))}
        </div>

        <div className="d-flex flex-wrap justify-content-end gap-3 mt-4">
          <button type="button" className="fb-botao fb-botao-claro" onClick={aoFechar}>Cancelar</button>
          <button type="button" className="fb-botao fb-botao-principal" disabled={!escolhido || enviando}
            onClick={() => aoConfirmar(posicao)}>
            {escolhido ? `Substituir ${escolhido.restaurante.nome}` : 'Substituir'}
          </button>
        </div>
      </div>
    </div>
  )
}
