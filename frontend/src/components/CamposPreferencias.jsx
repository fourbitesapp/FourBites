import { corDaCozinha } from '../utils/cozinhas.js'
import IconeCozinha from './IconeCozinha.jsx'

// Campos das preferências da recomendação, em 3 passos: cozinhas, faixa de preço e "mais alguma coisa".

// "Tanto faz" é guardado como null
const FAIXAS = [
  { valor: null, simbolo: '~', rotulo: 'Tanto faz' },
  { valor: '$', simbolo: '$', rotulo: 'mais em conta' },
  { valor: '$$', simbolo: '$$', rotulo: 'preço médio' },
  { valor: '$$$', simbolo: '$$$', rotulo: 'mais caro' },
]

export const PREFERENCIAS_VAZIAS = {
  categoriaIds: [], faixaPreco: null, precisaAcessibilidade: false, levaPets: false,
}

export default function CamposPreferencias({ categorias, dados, aoMudar }) {
  function alternarCategoria(id) {
    const marcadas = dados.categoriaIds.includes(id)
      ? dados.categoriaIds.filter((c) => c !== id)
      : [...dados.categoriaIds, id]
    aoMudar({ ...dados, categoriaIds: marcadas })
  }

  const quantas = dados.categoriaIds.length

  return (
    <>
      <section>
        <div className="fb-passo-titulo">
          <span className="fb-numero">1</span>
          <h2>Quais cozinhas você prefere?</h2>
        </div>
        <p className="mb-3">
          Marque quantas quiser · <strong className="fb-autor">
            {quantas === 0 ? 'nenhuma marcada' : quantas === 1 ? '1 marcada' : `${quantas} marcadas`}
          </strong>
        </p>
        <div className="d-flex flex-wrap gap-2">
          {categorias.map((c) => {
            const marcada = dados.categoriaIds.includes(c.id)
            return (
              <button key={c.id} type="button" aria-pressed={marcada} onClick={() => alternarCategoria(c.id)}
                className="fb-opcao-cozinha" style={marcada ? { background: 'var(--fb-amarelo-claro)', borderColor: 'var(--fb-amarelo)' } : undefined}>
                <span className="fb-opcao-cozinha-icone" style={{ background: corDaCozinha(c.id) }}>
                  <IconeCozinha nome={c.nome} tamanho={22} />
                </span>
                {c.nome}
                <i className={`bi ${marcada ? 'bi-check-lg' : 'bi-plus-lg'}`} aria-hidden="true"></i>
              </button>
            )
          })}
        </div>
      </section>

      <section className="mt-5">
        <div className="fb-passo-titulo">
          <span className="fb-numero">2</span>
          <h2>Quanto costuma gastar?</h2>
        </div>
        <div className="fb-precos" role="radiogroup" aria-label="Faixa de preço">
          {FAIXAS.map((f) => (
            <button key={f.rotulo} type="button" role="radio" aria-checked={dados.faixaPreco === f.valor}
              className={`fb-preco ${dados.faixaPreco === f.valor ? 'ativo' : ''}`}
              onClick={() => aoMudar({ ...dados, faixaPreco: f.valor })}>
              <strong>{f.simbolo}</strong>
              <span className="fw-bold">{f.rotulo}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-5">
        <div className="fb-passo-titulo">
          <span className="fb-numero">3</span>
          <h2>Mais alguma coisa?</h2>
        </div>
        <div className="fb-extras">
          <Extra icone="bi-universal-access" cor="#b5dcf8" titulo="Preciso de acessibilidade"
            texto="Lugares acessíveis ganham pontos na compatibilidade"
            ligado={dados.precisaAcessibilidade} aoMudar={(v) => aoMudar({ ...dados, precisaAcessibilidade: v })} />
          <Extra icone="bi-heart" cor="#ffc193" titulo="Costumo levar pets"
            texto="Lugares pet friendly ganham pontos na compatibilidade"
            ligado={dados.levaPets} aoMudar={(v) => aoMudar({ ...dados, levaPets: v })} />
        </div>
      </section>
    </>
  )
}

// Cartão que liga e desliga ao clicar.
function Extra({ icone, cor, titulo, texto, ligado, aoMudar }) {
  return (
    <button type="button" className={`fb-extra ${ligado ? 'ativo' : ''}`} aria-pressed={ligado} onClick={() => aoMudar(!ligado)}>
      <span className="fb-extra-icone" style={{ background: cor }}><i className={`bi ${icone}`} aria-hidden="true"></i></span>
      <span className="flex-grow-1">
        <strong className="d-block" style={{ fontSize: '1.08rem' }}>{titulo}</strong>
        <span className="fb-cartao-meta d-block mt-0">{texto}</span>
      </span>
      <span className="fw-bold small">{ligado ? 'Sim ✓' : 'Não'}</span>
    </button>
  )
}
