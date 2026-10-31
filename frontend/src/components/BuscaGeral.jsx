import { useEffect, useId, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import * as api from '../services/apiReal.js'
import { corDaCozinha } from '../utils/cozinhas.js'
import { formatarNota } from '../utils/formatos.js'
import Avatar from './Avatar.jsx'
import IconeCozinha from './IconeCozinha.jsx'
import SeloOficial from './SeloOficial.jsx'

// Busca da barra de cima: enquanto a pessoa digita, mostra restaurantes, cozinhas e pessoas do site.
// Enter (sem escolher nada) ou "Ver todos os resultados" leva para o Explorar com a busca.

const MAX_RESTAURANTES = 5
const MAX_COZINHAS = 3
const MAX_PESSOAS = 4

// Sem acento e em minúsculas, para "japo" achar "Japonesa" e "acai" achar "Açaí".
const simplificar = (texto) => String(texto ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

let categoriasEmCache = null // as categorias quase não mudam: busca uma vez só

export default function BuscaGeral() {
  const navegar = useNavigate()
  const idLista = useId()
  const caixa = useRef(null)

  const [texto, setTexto] = useState('')
  const [aberta, setAberta] = useState(false)
  const [buscando, setBuscando] = useState(false)
  const [resultado, setResultado] = useState({ restaurantes: [], cozinhas: [], pessoas: [] })
  const [ativo, setAtivo] = useState(-1) // opção marcada pelas setas do teclado

  const termo = texto.trim()

  // Busca com uma pequena espera (250 ms) depois que a pessoa para de digitar.
  useEffect(() => {
    if (!termo) {
      setResultado({ restaurantes: [], cozinhas: [], pessoas: [] })
      return
    }
    let cancelada = false
    setBuscando(true)
    const espera = setTimeout(async () => {
      const [restaurantes, pessoas, categorias] = await Promise.all([
        api.buscarRestaurantes({ busca: termo }).catch(() => []),
        // A busca de pessoas precisa de pelo menos 2 letras (regra do back-end).
        termo.length >= 2 ? api.buscarUsuarios(termo).catch(() => []) : [],
        categoriasEmCache || api.listarCategorias().then((lista) => (categoriasEmCache = lista)).catch(() => []),
      ])
      if (cancelada) return
      const procurado = simplificar(termo)
      setResultado({
        restaurantes: restaurantes.slice(0, MAX_RESTAURANTES),
        cozinhas: categorias.filter((c) => simplificar(c.nome).includes(procurado)).slice(0, MAX_COZINHAS),
        pessoas: pessoas.slice(0, MAX_PESSOAS),
      })
      setAtivo(-1)
      setBuscando(false)
    }, 250)
    return () => {
      cancelada = true
      clearTimeout(espera)
    }
  }, [termo])

  useEffect(() => {
    function cliqueFora(evento) {
      if (caixa.current && !caixa.current.contains(evento.target)) setAberta(false)
    }
    document.addEventListener('mousedown', cliqueFora)
    return () => document.removeEventListener('mousedown', cliqueFora)
  }, [])

  // Todas as opções numa lista só, na ordem em que aparecem (para as setas do teclado).
  const opcoes = [
    ...resultado.restaurantes.map((r) => ({ chave: `r${r.id}`, destino: `/restaurantes/${r.id}` })),
    ...resultado.cozinhas.map((c) => ({ chave: `c${c.id}`, destino: `/explorar?categoriaId=${c.id}` })),
    ...resultado.pessoas.map((p) => ({ chave: `p${p.id}`, destino: `/perfil/${p.username}` })),
    { chave: 'todos', destino: `/explorar?busca=${encodeURIComponent(termo)}` },
  ]
  const indice = (chave) => opcoes.findIndex((o) => o.chave === chave)
  const nada = !buscando && resultado.restaurantes.length + resultado.cozinhas.length + resultado.pessoas.length === 0
  const mostrar = aberta && termo !== ''

  function ir(destino) {
    setAberta(false)
    setTexto('')
    navegar(destino)
  }

  function enviar(evento) {
    evento.preventDefault()
    if (mostrar && ativo >= 0) return ir(opcoes[ativo].destino)
    setAberta(false)
    navegar(termo ? `/explorar?busca=${encodeURIComponent(termo)}` : '/explorar')
  }

  function teclas(evento) {
    if (evento.key === 'Escape') return setAberta(false)
    if (!mostrar || (evento.key !== 'ArrowDown' && evento.key !== 'ArrowUp')) return
    evento.preventDefault()
    const passo = evento.key === 'ArrowDown' ? 1 : -1
    setAtivo((atual) => (atual + passo + opcoes.length) % opcoes.length)
  }
  const opcao = (chave, conteudo) => (
    <li key={chave} id={`${idLista}-${chave}`} role="option" aria-selected={ativo === indice(chave)}
      className={`fb-busca-opcao ${ativo === indice(chave) ? 'ativa' : ''}`}
      onMouseDown={(e) => e.preventDefault()} onClick={() => ir(opcoes[indice(chave)].destino)}
      onMouseEnter={() => setAtivo(indice(chave))}>
      {conteudo}
    </li>
  )

  return (
    <form ref={caixa} className="fb-busca-barra" role="search" onSubmit={enviar}>
      <i className="bi bi-search" aria-hidden="true"></i>
      <input type="search" placeholder="Buscar restaurante, bairro ou pessoa" aria-label="Buscar"
        role="combobox" aria-expanded={mostrar} aria-controls={idLista} aria-autocomplete="list"
        aria-activedescendant={mostrar && ativo >= 0 ? `${idLista}-${opcoes[ativo].chave}` : undefined}
        value={texto} onChange={(e) => { setTexto(e.target.value); setAberta(true) }}
        onFocus={() => setAberta(true)} onKeyDown={teclas} />

      {mostrar && (
        <ul id={idLista} role="listbox" aria-label="Sugestões" className="fb-busca-resultados">
          {resultado.restaurantes.length > 0 && <li className="fb-busca-grupo" role="presentation">Restaurantes</li>}
          {resultado.restaurantes.map((r) => opcao(`r${r.id}`, (
            <>
              {r.fotoCapa ? <img src={r.fotoCapa} alt="" className="fb-busca-miniatura" /> : (
                <span className="fb-busca-miniatura" style={{ background: corDaCozinha(r.categoria) }}>
                  <IconeCozinha nome={r.categoria?.nome} icone={r.categoria?.icone} tamanho={22} />
                </span>
              )}
              <span className="fb-busca-texto">
                <strong>{r.nome}</strong>
                <small>{r.categoria?.nome} · {r.bairro}</small>
              </span>
              <span className="fb-busca-nota">★ {formatarNota(r.notaMedia)}</span>
            </>
          )))}

          {resultado.cozinhas.length > 0 && <li className="fb-busca-grupo" role="presentation">Cozinhas</li>}
          {resultado.cozinhas.map((c) => opcao(`c${c.id}`, (
            <>
              <span className="fb-busca-miniatura" style={{ background: corDaCozinha(c) }}>
                <IconeCozinha nome={c.nome} icone={c.icone} tamanho={22} />
              </span>
              <span className="fb-busca-texto">
                <strong>{c.nome}</strong>
                <small>Ver restaurantes desta cozinha</small>
              </span>
            </>
          )))}

          {resultado.pessoas.length > 0 && <li className="fb-busca-grupo" role="presentation">Pessoas</li>}
          {resultado.pessoas.map((p) => opcao(`p${p.id}`, (
            <>
              <Avatar nome={p.nome} foto={p.fotoPerfil} />
              <span className="fb-busca-texto">
                <strong>{p.nome} {p.oficial && <SeloOficial compacto />}</strong>
                <small>@{p.username}</small>
              </span>
            </>
          )))}

          {buscando && <li className="fb-busca-aviso" role="presentation">Buscando…</li>}
          {nada && <li className="fb-busca-aviso" role="presentation">Nada encontrado para “{termo}”.</li>}

          {opcao('todos', (
            <span className="fb-busca-todos">
              <i className="bi bi-search" aria-hidden="true"></i> Ver todos os resultados para “{termo}”
            </span>
          ))}
        </ul>
      )}
    </form>
  )
}
