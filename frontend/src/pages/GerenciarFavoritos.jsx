import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'

import Aviso from '../components/Aviso.jsx'
import BarraNavegacao from '../components/BarraNavegacao.jsx'
import IconeCozinha from '../components/IconeCozinha.jsx'
import Rodape from '../components/Rodape.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import * as api from '../services/apiReal.js'
import { corDaCozinha } from '../utils/cozinhas.js'
import { formatarNota } from '../utils/formatos.js'

const POSICOES = [1, 2, 3, 4]

// Gerenciar favoritos: remover (com desfazer) e mudar a posição com as setas.
// Mudar de posição usa o PUT /usuarios/me/favoritos/{posicao}: se já houver alguém lá, os dois trocam de lugar.
export default function GerenciarFavoritos() {
  const { usuario, logado } = useAuth()
  const [favoritos, setFavoritos] = useState(null)
  const [removido, setRemovido] = useState(null) // { posicao, restaurante } para o "Desfazer"
  const [erro, setErro] = useState(null)
  const [ocupado, setOcupado] = useState(false)

  const podeUsar = logado && usuario.papel === 'USUARIO'

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
        <Link to="/perfil" className="fb-link-discreto"><i className="bi bi-arrow-left" aria-hidden="true"></i> Voltar ao perfil</Link>

        <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mt-4 mb-5">
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
                      <div className="fb-favorito-edicao-foto" style={{ background: corDaCozinha(f.restaurante.categoria?.id) }}>
                        {f.restaurante.fotoCapa
                          ? <img src={f.restaurante.fotoCapa} alt="" />
                          : <span className="fb-sem-foto"><IconeCozinha nome={f.restaurante.categoria?.nome} tamanho={40} /></span>}
                        <span className="fb-numero-favorito">{posicao}</span>
                      </div>
                      <div className="flex-grow-1 p-4 d-flex flex-column justify-content-between gap-3">
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
                      <div>
                        <strong className="fb-autor">Posição livre</strong>
                        <p className="fb-cartao-meta mb-0">
                          Abra o perfil de um restaurante e toque em <strong className="fb-texto-destaque">Favoritar</strong> para adicioná-lo aqui.
                        </p>
                      </div>
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
