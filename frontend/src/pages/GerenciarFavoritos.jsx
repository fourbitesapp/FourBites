import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'

import Aviso from '../components/Aviso.jsx'
import BarraNavegacao from '../components/BarraNavegacao.jsx'
import BuscaRestaurante from '../components/BuscaRestaurante.jsx'
import IconeCozinha from '../components/IconeCozinha.jsx'
import Rodape from '../components/Rodape.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import * as api from '../services/apiReal.js'
import { corDaCozinha } from '../utils/cozinhas.js'
import { formatarNota } from '../utils/formatos.js'
import { temRecursosDeUsuario } from '../utils/papeis.js'

const POSICOES = [1, 2, 3, 4]

// Gerenciar favoritos: remover (com desfazer) e mudar a posição com as setas.
// Mudar de posição usa o PUT /usuarios/me/favoritos/{posicao}: se já houver alguém lá, os dois trocam de lugar.
export default function GerenciarFavoritos() {
  const { usuario, logado } = useAuth()
  const [favoritos, setFavoritos] = useState(null)
  const [removido, setRemovido] = useState(null) // { posicao, restaurante } para o "Desfazer"
  const [erro, setErro] = useState(null)
  const [ocupado, setOcupado] = useState(false)
  const [escolhendoEm, setEscolhendoEm] = useState(null) // posição livre em que a pessoa está buscando um restaurante

  const podeUsar = logado && temRecursosDeUsuario(usuario)

  useEffect(() => {
    if (podeUsar) {
      api.listarMeusFavoritos().then(setFavoritos).catch(setErro)
    }
  }, [podeUsar])

  if (!logado) {
    return <Navigate to="/login" replace state={{ voltarPara: '/perfil/favoritos' }} />
  }
  if (!podeUsar) {
    return <Navigate to="/" replace />
  }

  // Todas as ações devolvem a lista atualizada pelo back-end.
  async function executar(acao) {
    setErro(null)
    setOcupado(true)
    try {
      setFavoritos(await acao())
    } catch (falha) {
      setErro(falha)
    } finally {
      setOcupado(false)
    }
  }

  function mover(favorito, novaPosicao) {
    setRemovido(null)
    executar(() => api.colocarFavorito(novaPosicao, favorito.restaurante.id))
  }

  function remover(favorito) {
    setRemovido(favorito)
    executar(() => api.removerFavorito(favorito.posicao))
  }

  // Posição livre: busca o restaurante ali mesmo, sem precisar abrir o perfil dele.
  function adicionar(posicao, restaurante) {
    setRemovido(null)
    setEscolhendoEm(null)
    executar(() => api.colocarFavorito(posicao, restaurante.id))
  }

  function desfazer() {
    const { posicao, restaurante } = removido
    setRemovido(null)
    executar(() => api.colocarFavorito(posicao, restaurante.id))
  }

  const favoritoNa = (posicao) => favoritos?.find((f) => f.posicao === posicao)

  return (
    <>
      <BarraNavegacao />
      <main className="fb-conteudo">
        <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-5">
          <div>
            <span className="fb-mao">os 4 do coração</span>
            <h1 className="mt-1 mb-2">Restaurantes favoritos</h1>
            <p className="fb-subtitulo mb-0">Até 4 restaurantes, na ordem que você escolher. Eles aparecem no seu perfil público.</p>
          </div>
          <Link to="/perfil" className="fb-botao fb-botao-principal">Concluir</Link>
        </div>

        <Aviso>{erro?.message}</Aviso>

        {removido && (
          <div className="fb-aviso-escuro mb-4" role="status">
            <i className="bi bi-trash" aria-hidden="true"></i>
            <span>{removido.restaurante.nome} removido dos favoritos. A posição {removido.posicao} está livre.</span>
            <button type="button" className="fb-botao-texto fb-link-claro" onClick={desfazer} disabled={ocupado}>Desfazer</button>
          </div>
        )}

        {favoritos === null ? (
          !erro && <p className="fb-vazio">Carregando…</p>
        ) : (
          <div className="row g-4">
            {POSICOES.map((posicao) => {
              const f = favoritoNa(posicao)
              return (
                <div key={posicao} className="col-lg-6">
                  {f ? (
                    <article className="fb-cartao fb-favorito-edicao">
                      <div className="fb-favorito-edicao-foto" style={{ background: corDaCozinha(f.restaurante.categoria) }}>
                        {f.restaurante.fotoCapa
                          ? <img src={f.restaurante.fotoCapa} alt="" />
                          : <span className="fb-sem-foto"><IconeCozinha nome={f.restaurante.categoria?.nome} icone={f.restaurante.categoria?.icone} tamanho={40} /></span>}
                        <span className="fb-numero-favorito">{posicao}</span>
                      </div>
                      <div className="fb-favorito-edicao-info flex-grow-1 p-4 d-flex flex-column justify-content-between gap-3">
                        <div>
                          <h3 className="fb-cartao-titulo" style={{ fontSize: '1.25rem' }}>{f.restaurante.nome}</h3>
                          <div className="fb-cartao-meta mt-0">
                            {f.restaurante.categoria?.nome} · <span className="fb-nota">★ {formatarNota(f.restaurante.notaMedia)}</span>
                          </div>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <button type="button" className="fb-botao-seta" disabled={ocupado || posicao === 1}
                            onClick={() => mover(f, posicao - 1)} aria-label={`Mover ${f.restaurante.nome} para a posição ${posicao - 1}`}>
                            <i className="bi bi-arrow-left" aria-hidden="true"></i>
                          </button>
                          <button type="button" className="fb-botao-seta" disabled={ocupado || posicao === 4}
                            onClick={() => mover(f, posicao + 1)} aria-label={`Mover ${f.restaurante.nome} para a posição ${posicao + 1}`}>
                            <i className="bi bi-arrow-right" aria-hidden="true"></i>
                          </button>
                          <button type="button" className="fb-botao fb-botao-contorno fb-botao-pequeno ms-auto" disabled={ocupado}
                            onClick={() => remover(f)}>
                            Remover
                          </button>
                        </div>
                      </div>
                    </article>
                  ) : (
                    <article className="fb-posicao-livre">
                      <span className="fb-numero" style={{ background: 'var(--fb-amarelo)', color: 'var(--fb-tinta)' }}>{posicao}</span>
                      {escolhendoEm === posicao ? (
                        <div className="flex-grow-1" style={{ minWidth: 0 }}>
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <strong className="fb-autor">Escolha o restaurante</strong>
                            <button type="button" className="fb-botao-texto fb-link" onClick={() => setEscolhendoEm(null)}>
                              Cancelar
                            </button>
                          </div>
                          <BuscaRestaurante aoEscolher={(r) => adicionar(posicao, r)} />
                        </div>
                      ) : (
                        <div className="flex-grow-1">
                          <strong className="fb-autor">Posição livre</strong>
                          <p className="fb-cartao-meta mb-2">Busque um restaurante para colocar aqui.</p>
                          <button type="button" className="fb-botao fb-botao-principal fb-botao-pequeno" disabled={ocupado}
                            onClick={() => setEscolhendoEm(posicao)}>
                            <i className="bi bi-plus-lg" aria-hidden="true"></i> Adicionar restaurante
                          </button>
                        </div>
                      )}
                    </article>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
      <Rodape />
    </>
  )
}