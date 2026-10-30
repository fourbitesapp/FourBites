import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'

import Avatar from '../components/Avatar.jsx'
import Aviso from '../components/Aviso.jsx'
import BarraNavegacao from '../components/BarraNavegacao.jsx'
import BuscaRestaurante from '../components/BuscaRestaurante.jsx'
import CartaoRestaurante from '../components/CartaoRestaurante.jsx'
import Rodape from '../components/Rodape.jsx'
import SeloOficial from '../components/SeloOficial.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import * as api from '../services/apiReal.js'
import { corDaLista, iconeDaLista, textoQuantidade } from '../utils/listas.js'
import { temRecursosDeUsuario } from '../utils/papeis.js'

// Uma lista de restaurantes. Qualquer pessoa vê as públicas; o dono vê as privadas também
// e pode adicionar, tirar restaurantes, editar e excluir.
export default function Lista() {
  const { id } = useParams()
  const navegar = useNavigate()
  const local = useLocation()
  const { usuario, logado } = useAuth()
  const [seguindoAgora, setSeguindoAgora] = useState(false)

  const [lista, setLista] = useState(null)
  const [erro, setErro] = useState(null)
  const [aviso, setAviso] = useState(null)
  const [adicionando, setAdicionando] = useState(false)
  const [buscaVersao, setBuscaVersao] = useState(0) // troca para limpar o campo de busca depois de adicionar

  useEffect(() => {
    setLista(null)
    setErro(null)
    api.buscarLista(id).then(setLista).catch(setErro)
  }, [id])

  async function adicionar(restaurante) {
    setAviso(null)
    try {
      setLista(await api.adicionarNaLista(lista.id, restaurante.id))
      setBuscaVersao((v) => v + 1)
    } catch (falha) {
      setAviso(falha.message) // 409: já está na lista
    }
  }

  async function tirar(restaurante) {
    setAviso(null)
    try {
      setLista(await api.tirarDaLista(lista.id, restaurante.id))
    } catch (falha) {
      setAviso(falha.message)
    }
  }

  // Seguir a lista de outra pessoa (só conta USUARIO; a lista aparece em "Listas que sigo" no perfil).
  async function alternarSeguir() {
    setAviso(null)
    setSeguindoAgora(true)
    try {
      await (lista.seguindo ? api.deixarDeSeguirLista(lista.id) : api.seguirLista(lista.id))
      setLista({ ...lista, seguindo: !lista.seguindo })
    } catch (falha) {
      setAviso(falha.message)
    } finally {
      setSeguindoAgora(false)
    }
  }

  async function excluir() {
    if (!window.confirm(`Excluir a lista "${lista.nome}"? Os restaurantes não são apagados, só a lista.`)) return
    try {
      await api.excluirLista(lista.id)
      navegar('/perfil', { replace: true })
    } catch (falha) {
      setAviso(falha.message)
    }
  }

  if (erro) {
    return (
      <>
        <BarraNavegacao />
        <main className="fb-conteudo">
          <Aviso>{erro.status === 404 ? 'Esta lista não existe ou é privada.' : erro.message}</Aviso>
        </main>
        <Rodape />
      </>
    )
  }

  if (!lista) {
    return (
      <>
        <BarraNavegacao />
        <main className="fb-conteudo"><p className="fb-vazio">Carregando…</p></main>
      </>
    )
  }

  const cor = corDaLista(lista)

  return (
    <>
      <BarraNavegacao />
      <main className="fb-conteudo">
        {/* Cabeçalho estilo "playlist": capa quadrada à esquerda (fotos dos restaurantes ou o ícone na cor da lista)
            e, ao lado, frase à mão, nome, descrição, dono e as ações. */}
        <section className="fb-lista-cabecalho">
          <div className={`fb-lista-capa fb-lista-capa-grande ${lista.capas.length >= 4 ? 'mosaico' : ''}`}
            style={{ background: cor }} aria-hidden="true">
            {lista.capas.length >= 4
              ? lista.capas.map((url) => <img key={url} src={url} alt="" />)
              : lista.capas.length > 0
                ? <img src={lista.capas[0]} alt="" />
                : null}
            <span className="fb-lista-selo-icone" style={{ background: cor }}>
              <i className={`bi ${iconeDaLista(lista)}`}></i>
            </span>
          </div>

          <div className="fb-lista-cabecalho-texto">
            <span className="fb-mao">
              {lista.publica ? 'lista pública' : 'lista privada'}
              {!lista.publica && <i className="bi bi-lock-fill ms-1 fs-6" aria-hidden="true"></i>}
            </span>
            <h1 className="mt-1 mb-2">{lista.nome}</h1>
            {lista.descricao && <p className="fb-subtitulo mb-2">{lista.descricao}</p>}
            <Link to={`/perfil/${lista.dono.username}`} className="fb-lista-dono">
              <Avatar nome={lista.dono.nome} foto={lista.dono.fotoPerfil} tamanho="nav" />
              <span>
                por <strong>{lista.dono.nome}</strong> {lista.dono.oficial && <SeloOficial compacto />}
                {' · '}{textoQuantidade(lista.totalRestaurantes)}
              </span>
            </Link>

            {/* Seguir: lista pública de outra pessoa */}
            {!lista.minha && lista.publica && logado && temRecursosDeUsuario(usuario) && (
              <div className="mt-3">
                <button type="button" disabled={seguindoAgora} onClick={alternarSeguir}
                  className={`fb-botao fb-botao-pequeno ${lista.seguindo ? 'fb-botao-claro' : 'fb-botao-principal'}`}>
                  {lista.seguindo
                    ? <><i className="bi bi-check-lg" aria-hidden="true"></i> Seguindo a lista</>
                    : <><i className="bi bi-plus-lg" aria-hidden="true"></i> Seguir lista</>}
                </button>
              </div>
            )}
            {!logado && lista.publica && (
              <div className="mt-3">
                <Link to="/login" state={{ voltarPara: local.pathname, aviso: 'Entre na sua conta para seguir listas.' }}
                  className="fb-botao fb-botao-principal fb-botao-pequeno">Entre para seguir a lista</Link>
              </div>
            )}

            {lista.minha && (
              <div className="d-flex flex-wrap align-items-center gap-2 mt-3">
                <button type="button" className="fb-botao fb-botao-principal fb-botao-pequeno"
                  onClick={() => setAdicionando(!adicionando)} aria-expanded={adicionando}>
                  <i className={`bi ${adicionando ? 'bi-check-lg' : 'bi-plus-lg'}`} aria-hidden="true"></i>
                  {adicionando ? 'Concluir' : 'Adicionar restaurante'}
                </button>
                <Link to={`/listas/${lista.id}/editar`} className="fb-botao fb-botao-claro fb-botao-pequeno fb-botao-so-icone"
                  aria-label="Editar lista" title="Editar lista">
                  <i className="bi bi-pencil" aria-hidden="true"></i>
                </Link>
                <button type="button" className="fb-botao fb-botao-claro fb-botao-pequeno fb-botao-so-icone" onClick={excluir}
                  aria-label="Excluir lista" title="Excluir lista">
                  <i className="bi bi-trash" aria-hidden="true"></i>
                </button>
              </div>
            )}
          </div>
        </section>

        <Aviso>{aviso}</Aviso>

        {/* Busca para adicionar (abre pelo botão do cabeçalho) */}
        {lista.minha && adicionando && (
          <section className="fb-caixa mt-4">
            <h2 className="mb-3" style={{ fontSize: '1.2rem' }}>Qual restaurante entra na lista?</h2>
            <BuscaRestaurante key={buscaVersao} aoEscolher={adicionar} />
          </section>
        )}

        <hr className="fb-divisor-lista" />

        {/* Restaurantes da lista */}
        <section>
          {lista.restaurantes.length === 0 ? (
            <p className="fb-vazio">
              {lista.minha ? 'Sua lista está vazia. Toque em "Adicionar restaurante" para começar.' : 'Esta lista ainda está vazia.'}
            </p>
          ) : (
            <div className="row g-4">
              {lista.restaurantes.map((r) => (
                <div key={r.id} className="col-sm-6 col-lg-4 position-relative">
                  <CartaoRestaurante restaurante={r} />
                  {lista.minha && (
                    <button type="button" className="fb-icone-nav fb-tirar-da-lista" onClick={() => tirar(r)}
                      aria-label={`Tirar ${r.nome} da lista`} title="Tirar da lista">
                      <i className="bi bi-x-lg" aria-hidden="true"></i>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
      <Rodape />
    </>
  )
}