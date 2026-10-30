import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'

import Aviso from '../components/Aviso.jsx'
import BarraNavegacao from '../components/BarraNavegacao.jsx'
import BuscaRestaurante from '../components/BuscaRestaurante.jsx'
import Estrelas from '../components/Estrelas.jsx'
import IconeCozinha from '../components/IconeCozinha.jsx'
import Rodape from '../components/Rodape.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import * as api from '../services/apiReal.js'
import { corDaCozinha } from '../utils/cozinhas.js'
import { formatarNota } from '../utils/formatos.js'
import { conferirImagem } from '../utils/validacoes.js'
import { temRecursosDeUsuario } from '../utils/papeis.js'

const CATEGORIAS = [
  ['notaComida', 'Comida'],
  ['notaAmbiente', 'Ambiente'],
  ['notaAtendimento', 'Atendimento'],
  ['notaCusto', 'Custo-benefício'],
]

const MAXIMO_FOTOS = 5
const NOTAS_VAZIAS = { notaComida: 0, notaAmbiente: 0, notaAtendimento: 0, notaCusto: 0 }

// Novo post e Editar post.
// Pelo perfil do restaurante (/restaurantes/:id/avaliar) o restaurante já vem escolhido;
// pelo botão "Novo post" (/novo-post) o usuário escolhe o restaurante na busca.
export default function NovaAvaliacao() {
  const { id: idDaRota } = useParams()
  const local = useLocation()
  const navegar = useNavigate()
  const { usuario, logado } = useAuth()
  const seletorDeFotos = useRef(null)

  const [restauranteId, setRestauranteId] = useState(idDaRota || null)
  const [restaurante, setRestaurante] = useState(null)
  const [avaliacaoId, setAvaliacaoId] = useState(null)
  const [notas, setNotas] = useState(NOTAS_VAZIAS)
  const [comentario, setComentario] = useState('')
  const [fotos, setFotos] = useState([]) // endereços já enviados ao Cloudinary
  const [erroFotos, setErroFotos] = useState(null)
  const [enviandoFotos, setEnviandoFotos] = useState(false)
  const [erro, setErro] = useState(null)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    setRestauranteId(idDaRota || null)
  }, [idDaRota])

  // Ao escolher o restaurante: carrega os dados dele e, se o usuário já avaliou, a avaliação existente.
  useEffect(() => {
    if (!logado || !restauranteId) {
      setRestaurante(null)
      return
    }
    let cancelada = false

    async function carregar() {
      const perfil = await api.buscarRestaurante(restauranteId)
      const existente = perfil.minhaAvaliacaoId ? await api.buscarAvaliacao(perfil.minhaAvaliacaoId) : null
      if (cancelada) {
        return
      }
      setRestaurante(perfil)
      if (existente) {
        setAvaliacaoId(existente.id)
        setNotas({
          notaComida: existente.notaComida,
          notaAmbiente: existente.notaAmbiente,
          notaAtendimento: existente.notaAtendimento,
          notaCusto: existente.notaCusto,
        })
        setComentario(existente.comentario || '')
        setFotos(existente.fotos)
      } else {
        setAvaliacaoId(null)
        setNotas(NOTAS_VAZIAS)
        setComentario('')
        setFotos([])
      }
    }

    setErro(null)
    carregar().catch((falha) => !cancelada && setErro(falha))
    return () => {
      cancelada = true
    }
  }, [restauranteId, logado])

  if (!logado) {
    return <Navigate to="/login" state={{ voltarPara: local.pathname }} replace />
  }

  const editando = avaliacaoId !== null
  const todasMarcadas = Object.values(notas).every((nota) => nota > 0)
  const notaGeral = todasMarcadas ? Object.values(notas).reduce((soma, nota) => soma + nota, 0) / 4 : null
  const voltarPara = idDaRota ? `/restaurantes/${idDaRota}` : '/'

  // Cada foto escolhida é enviada na hora (POST /uploads); a avaliação guarda só os endereços.
  async function adicionarFotos(evento) {
    const escolhidas = Array.from(evento.target.files)
    evento.target.value = ''
    setErroFotos(null)
    if (fotos.length + escolhidas.length > MAXIMO_FOTOS) {
      setErroFotos(`Envie no máximo ${MAXIMO_FOTOS} fotos.`)
      return
    }
    for (const arquivo of escolhidas) {
      const problema = conferirImagem(arquivo)
      if (problema) {
        setErroFotos(`${arquivo.name}: ${problema}`)
        return
      }
    }
    setEnviandoFotos(true)
    try {
      const novas = []
      for (const arquivo of escolhidas) {
        const { url } = await api.enviarArquivo(arquivo)
        novas.push(url)
      }
      setFotos((atuais) => [...atuais, ...novas])
    } catch (falha) {
      setErroFotos(falha.campos?.arquivo || falha.message)
    } finally {
      setEnviandoFotos(false)
    }
  }

  async function aoEnviar(evento) {
    evento.preventDefault()
    setErro(null)
    setEnviando(true)
    try {
      const dados = { ...notas, comentario, fotos }
      if (editando) {
        await api.editarAvaliacao(avaliacaoId, dados)
      } else {
        await api.criarAvaliacao(restauranteId, dados)
      }
      navegar(`/restaurantes/${restauranteId}`)
    } catch (falha) {
      setErro(falha)
      setEnviando(false)
    }
  }

  return (
    <>
      <BarraNavegacao />
      <main className="fb-pagina-media">
        <span className="fb-mao">{editando ? 'mudou de ideia?' : 'conta tudo!'}</span>
        <h1 className="mt-1">{editando ? 'Editar post' : 'Novo post'}</h1>
        <p className="fb-subtitulo mb-5">Conte como foi sua experiência. A nota geral é a média das quatro notas.</p>

        {!temRecursosDeUsuario(usuario) ? (
          <Aviso tipo="info">Avaliar é exclusivo para contas de usuário.</Aviso>
        ) : restauranteId && !restaurante ? (
          erro ? <Aviso>{erro.message}</Aviso> : <p className="fb-vazio">Carregando…</p>
        ) : (
          <form onSubmit={aoEnviar} className="d-flex flex-column gap-4">
            <Aviso>{erro?.message}</Aviso>

            {/* 1. Restaurante */}
            <section className="fb-caixa">
              <div className="fb-passo-titulo">
                <span className="fb-numero">1</span>
                <h2>Qual restaurante?</h2>
              </div>
              {!restaurante ? (
                <BuscaRestaurante aoEscolher={(r) => setRestauranteId(r.id)} />
              ) : (
                <>
                  <div className="fb-restaurante-escolhido">
                    {restaurante.fotos?.[0] ? (
                      <img src={restaurante.fotos[0]} alt="" />
                    ) : (
                      <span className="fb-sem-foto" style={{ background: corDaCozinha(restaurante.categoria) }}>
                        <IconeCozinha nome={restaurante.categoria?.nome} icone={restaurante.categoria?.icone} tamanho={28} />
                      </span>
                    )}
                    <div className="flex-grow-1">
                      <strong className="fb-autor" style={{ fontSize: '1.1rem' }}>{restaurante.nome}</strong>
                      <div className="fb-cartao-meta">
                        {restaurante.categoria?.nome} · {restaurante.bairro}, {restaurante.cidade}
                      </div>
                    </div>
                    {!idDaRota && (
                      <button type="button" className="fb-botao fb-botao-claro fb-botao-pequeno"
                        onClick={() => setRestauranteId(null)}>Trocar</button>
                    )}
                  </div>
                  {editando && (
                    <div className="mt-3">
                      <Aviso tipo="info">
                        Você já avaliou este restaurante. As mudanças que fizer aqui vão editar a sua avaliação.
                      </Aviso>
                    </div>
                  )}
                </>
              )}
            </section>

            {/* Sem restaurante escolhido, o resto do formulário fica desativado */}
            <fieldset disabled={!restaurante} className={`d-flex flex-column gap-4 ${restaurante ? '' : 'fb-desativado'}`}>
              {/* 2. Notas */}
              <section className="fb-caixa">
                <div className="fb-passo-titulo">
                  <span className="fb-numero">2</span>
                  <h2>Suas notas</h2>
                </div>
                <div className="row g-4 align-items-stretch">
                  <div className="col-md-8">
                    {CATEGORIAS.map(([campo, nome]) => (
                      <div key={campo} className="fb-linha-nota">
                        <span className="fb-linha-nota-nome">{nome}</span>
                        <Estrelas valor={notas[campo]} rotulo={nome}
                          aoMudar={(nota) => setNotas({ ...notas, [campo]: nota })} />
                        <strong className="fb-linha-nota-valor">{notas[campo] || '–'}</strong>
                        {erro?.campos[campo] && <div className="fb-erro-campo w-100">{erro.campos[campo]}</div>}
                      </div>
                    ))}
                  </div>
                  <div className="col-md-4">
                    <div className="fb-nota-geral">
                      <span className="fb-nota-geral-rotulo">Nota geral</span>
                      <span className="fb-nota-geral-valor">{formatarNota(notaGeral, 2)}</span>
                      <span>de 5</span>
                      <small>Média das 4 notas, calculada automaticamente</small>
                    </div>
                  </div>
                </div>
              </section>

              {/* 3. Comentário */}
              <section className="fb-caixa">
                <div className="fb-passo-titulo">
                  <span className="fb-numero">3</span>
                  <h2>
                    <label htmlFor="comentario">Comentário</label>{' '}
                    <span className="fb-apagado fw-normal" style={{ fontFamily: 'var(--fb-letra)', fontSize: '1rem' }}>(opcional)</span>
                  </h2>
                </div>
                <textarea
                  id="comentario" className="fb-area-texto" rows="4" maxLength="2000"
                  placeholder="Como foi a comida, o atendimento, o ambiente?"
                  value={comentario} onChange={(e) => setComentario(e.target.value)}
                ></textarea>
                {erro?.campos.comentario && <div className="fb-erro-campo">{erro.campos.comentario}</div>}
              </section>

              {/* 4. Fotos */}
              <section className="fb-caixa">
                <div className="fb-passo-titulo">
                  <span className="fb-numero">4</span>
                  <h2 className="flex-grow-1">Fotos</h2>
                  <span className="fb-autor fb-apagado">{fotos.length}/{MAXIMO_FOTOS}</span>
                </div>
                {fotos.length > 0 && (
                  <div className="d-flex flex-wrap gap-3 mb-3">
                    {fotos.map((url) => (
                      <div key={url} className="fb-miniatura">
                        <img src={url} alt="" className="fb-foto-avaliacao" />
                        <button type="button" aria-label="Remover foto"
                          onClick={() => setFotos(fotos.filter((f) => f !== url))}>
                          <i className="bi bi-x" aria-hidden="true"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {fotos.length < MAXIMO_FOTOS && (
                  <>
                    <input ref={seletorDeFotos} type="file" accept="image/jpeg,image/png" multiple hidden onChange={adicionarFotos} />
                    <button type="button" className="fb-area-envio" disabled={enviandoFotos}
                      onClick={() => seletorDeFotos.current.click()}>
                      <span className="fb-icone-suave"><i className="bi bi-camera" aria-hidden="true"></i></span>
                      <strong>{enviandoFotos ? 'Enviando…' : 'Adicionar fotos'}</strong>
                      <small>JPG ou PNG, até 5 MB cada</small>
                    </button>
                  </>
                )}
                {(erroFotos || erro?.campos.fotos) && <div className="fb-erro-campo">{erroFotos || erro.campos.fotos}</div>}
              </section>
            </fieldset>

            <div className="d-flex justify-content-end gap-3 mt-2">
              <Link to={voltarPara} className="fb-botao fb-botao-claro">Cancelar</Link>
              <button type="submit" className="fb-botao fb-botao-principal"
                disabled={!restaurante || !todasMarcadas || enviando || enviandoFotos}>
                {enviando ? 'Publicando…' : editando ? 'Salvar alterações' : 'Publicar'}
              </button>
            </div>
          </form>
        )}
      </main>
      <Rodape />
    </>
  )
}

