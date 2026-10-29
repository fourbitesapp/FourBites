import { useEffect, useState } from 'react'

import AreaRestrita from '../../components/AreaRestrita.jsx'
import Aviso from '../../components/Aviso.jsx'
import IconeCozinha from '../../components/IconeCozinha.jsx'
import PainelAdmin from '../../components/PainelAdmin.jsx'
import * as api from '../../services/apiReal.js'
import { corDaCozinha } from '../../utils/cozinhas.js'

// Aba "Categorias": lista com quantos restaurantes cada uma tem; criar, renomear e excluir.
// Categorias novas também nascem ao aprovar um cadastro com "outra categoria".
// Excluir só funciona se nenhum restaurante usa a categoria (o back-end responde 409).
export default function AdminCategorias() {
  return (
    <AreaRestrita papel="ADMIN">
      <ListaDeCategorias />
    </AreaRestrita>
  )
}

function ListaDeCategorias() {
  const [categorias, setCategorias] = useState(null)
  const [erro, setErro] = useState(null)
  const [editandoId, setEditandoId] = useState(null)
  const [novoNome, setNovoNome] = useState('')
  const [erroNome, setErroNome] = useState(null)
  const [salvando, setSalvando] = useState(false)
  const [nomeNova, setNomeNova] = useState('')
  const [erroNova, setErroNova] = useState(null)
  const [criando, setCriando] = useState(false)
  const [erroExcluir, setErroExcluir] = useState(null)

  useEffect(() => {
    api.adminListarCategorias().then(setCategorias).catch(setErro)
  }, [])

  function comecarAEditar(categoria) {
    setEditandoId(categoria.id)
    setNovoNome(categoria.nome)
    setErroNome(null)
  }

  async function salvar(evento) {
    evento.preventDefault()
    if (!novoNome.trim()) {
      setErroNome('Escreva o nome da categoria.')
      return
    }
    setSalvando(true)
    setErroNome(null)
    try {
      const atualizada = await api.adminRenomearCategoria(editandoId, novoNome.trim())
      setCategorias((lista) => lista.map((c) => (c.id === atualizada.id ? atualizada : c)))
      setEditandoId(null)
    } catch (falha) {
      setErroNome(falha.campos?.nome || falha.message) // 409 quando o nome já existe
    } finally {
      setSalvando(false)
    }
  }

  async function criar(evento) {
    evento.preventDefault()
    if (!nomeNova.trim()) {
      setErroNova('Escreva o nome da categoria.')
      return
    }
    setCriando(true)
    setErroNova(null)
    try {
      const nova = await api.adminCriarCategoria(nomeNova.trim())
      setCategorias((lista) => [...lista, nova].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')))
      setNomeNova('')
    } catch (falha) {
      setErroNova(falha.campos?.nome || falha.message) // 409 quando o nome já existe
    } finally {
      setCriando(false)
    }
  }

  async function excluir(categoria) {
    if (!window.confirm(`Excluir a categoria "${categoria.nome}"?`)) return
    setErroExcluir(null)
    try {
      await api.adminExcluirCategoria(categoria.id)
      setCategorias((lista) => lista.filter((c) => c.id !== categoria.id))
    } catch (falha) {
      setErroExcluir(falha.message) // 409: ainda há restaurantes nela
    }
  }

  return (
    <PainelAdmin>
      <Aviso>{erro?.message}</Aviso>
      <Aviso>{erroExcluir}</Aviso>
      <div className="fb-analise">
        <section className="fb-caixa" style={{ flex: '999 1 560px', minWidth: 0, padding: '0.75rem 1.75rem' }}>
          <form onSubmit={criar} className="d-flex flex-wrap align-items-center gap-2 py-3">
            <label htmlFor="nova-categoria" className="visually-hidden">Nome da nova categoria</label>
            <span className={`fb-campo flex-grow-1 py-2 ${erroNova ? 'fb-campo-erro' : ''}`} style={{ flexBasis: '240px' }}>
              <input id="nova-categoria" placeholder="Nova categoria (ex.: Tailandesa)" value={nomeNova}
                onChange={(e) => setNomeNova(e.target.value)} />
            </span>
            <button type="submit" className="fb-botao fb-botao-principal fb-botao-pequeno" disabled={criando}>
              <i className="bi bi-plus-lg" aria-hidden="true"></i> {criando ? 'Criando…' : 'Criar'}
            </button>
            {erroNova && <div className="fb-erro-campo w-100">{erroNova}</div>}
          </form>

          {!categorias && !erro && <p className="fb-vazio">Carregando…</p>}
          <ul className="fb-lista-categorias">
            {categorias?.map((c) => (
              <li key={c.id}>
                <span className="fb-mini fb-mini-pequeno" style={{ background: corDaCozinha(c.id) }} aria-hidden="true">
                  <IconeCozinha nome={c.nome} tamanho={26} />
                </span>
                {editandoId === c.id ? (
                  <form onSubmit={salvar} className="d-flex flex-wrap align-items-center gap-2 flex-grow-1">
                    <label htmlFor="renomear" className="visually-hidden">Novo nome da categoria</label>
                    <span className={`fb-campo flex-grow-1 py-2 ${erroNome ? 'fb-campo-erro' : ''}`} style={{ flexBasis: '240px' }}>
                      <input id="renomear" value={novoNome} autoFocus onChange={(e) => setNovoNome(e.target.value)} />
                    </span>
                    <button type="button" className="fb-botao fb-botao-claro fb-botao-pequeno"
                      onClick={() => setEditandoId(null)}>Cancelar</button>
                    <button type="submit" className="fb-botao fb-botao-principal fb-botao-pequeno" disabled={salvando}>
                      {salvando ? 'Salvando…' : 'Salvar'}
                    </button>
                    {erroNome && <div className="fb-erro-campo w-100">{erroNome}</div>}
                  </form>
                ) : (
                  <>
                    <strong className="flex-grow-1 fs-6" style={{ color: 'var(--fb-tinta)' }}>{c.nome}</strong>
                    <span className="fb-apagado" style={{ minWidth: '8rem', fontSize: '0.95rem' }}>
                      {c.totalRestaurantes === 0 ? 'nenhum restaurante'
                        : `${c.totalRestaurantes} ${c.totalRestaurantes === 1 ? 'restaurante' : 'restaurantes'}`}
                    </span>
                    <button type="button" className="fb-botao fb-botao-claro fb-botao-pequeno"
                      onClick={() => comecarAEditar(c)}>Renomear</button>
                    <button type="button" className="fb-botao fb-botao-claro fb-botao-pequeno"
                      onClick={() => excluir(c)} disabled={c.totalRestaurantes > 0}
                      title={c.totalRestaurantes > 0 ? 'Troque a categoria dos restaurantes antes de excluir' : undefined}>
                      Excluir
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </section>

        <aside className="fb-explicacao">
          <h2>Como surgem categorias novas</h2>
          <p>
            Pelo campo acima, ou quando um restaurante sugere uma categoria que não existe: ela é criada na hora de
            aprovar o cadastro (aba Cadastros).
          </p>
          <p>Renomear muda em todos os restaurantes que usam essa categoria.</p>
          <p>Só dá para excluir uma categoria que nenhum restaurante usa.</p>
        </aside>
      </div>
    </PainelAdmin>
  )
}
