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

// "Mais alguma coisa?": cada preferência combina com uma característica do restaurante.
// Marcada, o restaurante que tem a característica ganha 3 pontos na compatibilidade.
const EXTRAS = [
  { campo: 'precisaAcessibilidade', icone: 'bi-universal-access', cor: '#b5dcf8', titulo: 'Acessibilidade',
    texto: 'Lugares acessíveis' },
  { campo: 'levaPets', icone: 'bi-pata', cor: '#ffc193', titulo: 'Levo pets',
    texto: 'Lugares pet friendly' },
  { campo: 'levaCriancas', icone: 'bi-balloon', cor: '#ffd98a', titulo: 'Vou com crianças',
    texto: 'Lugares com espaço kids' },
  { campo: 'precisaEstacionamento', icone: 'bi-car-front', cor: '#d9eda3', titulo: 'Estacionamento',
    texto: 'Lugares com estacionamento' },
  { campo: 'fuma', icone: 'bi-wind', cor: '#e6ddd3', titulo: 'Área para fumantes',
    texto: 'Lugares com área para fumar' },
]

export const PREFERENCIAS_VAZIAS = {
  categoriaIds: [], faixaPreco: null,
  ...Object.fromEntries(EXTRAS.map((e) => [e.campo, false])),
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
                <span className="fb-opcao-cozinha-icone" style={{ background: corDaCozinha(c) }}>
                  <IconeCozinha nome={c.nome} icone={c.icone} tamanho={22} />
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
        <p className="fb-cartao-meta mb-3">Marque o que é importante pra você: os lugares que têm ganham pontos na compatibilidade.</p>
        <div className="fb-extras">
          {EXTRAS.map((e) => (
            <Extra key={e.campo} icone={e.icone} cor={e.cor} titulo={e.titulo} texto={e.texto}
              ligado={Boolean(dados[e.campo])} aoMudar={(v) => aoMudar({ ...dados, [e.campo]: v })} />
          ))}
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
        <strong className="d-block">{titulo}</strong>
        <small className="fb-apagado">{texto}</small>
      </span>
      <span className="fb-extra-estado">{ligado ? 'Sim' : 'Não'}</span>
    </button>
  )
}
