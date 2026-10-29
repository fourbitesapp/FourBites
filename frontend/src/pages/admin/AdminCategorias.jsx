import { useEffect, useState } from 'react'

import AreaRestrita from '../../components/AreaRestrita.jsx'
import Aviso from '../../components/Aviso.jsx'
import IconeCozinha from '../../components/IconeCozinha.jsx'
import PainelAdmin from '../../components/PainelAdmin.jsx'
import * as api from '../../services/apiReal.js'
import { CORES, OPCOES_DE_ICONE, corDaCozinha } from '../../utils/cozinhas.js'

// Aba "Categorias": lista com quantos restaurantes cada uma tem; criar, editar (nome, cor e ícone) e excluir.
// Categorias novas também nascem ao aprovar um cadastro
// Excluir só funciona se nenhum restaurante usa a categoria
export default function AdminCategorias() {
  return (
    <AreaRestrita papel="ADMIN">
      <ListaDeCategorias />
    </AreaRestrita>
  )
}

const ordenar = (lista) => [...lista].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))

function ListaDeCategorias() {
  const [categorias, setCategorias] = useState(null)
  const [erro, setErro] = useState(null)
  const [editandoId, setEditandoId] = useState(null)
  const [edicao, setEdicao] = useState({ nome: '', cor: '', icone: '' })
  const [erroEdicao, setErroEdicao] = useState(null)
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
    setEdicao({ nome: categoria.nome, cor: categoria.cor || '', icone: categoria.icone || '' })
    setErroEdicao(null)
  }

  async function salvar(evento) {
    evento.preventDefault()
    if (!edicao.nome.trim()) {
      setErroEdicao('Escreva o nome da categoria.')
      return
    }
    setSalvando(true)
    setErroEdicao(null)
    try {
      const atualizada = await api.adminAtualizarCategoria(editandoId, {
        nome: edicao.nome.trim(),
        cor: edicao.cor || null, // vazio = cor padrão
        icone: edicao.icone || null, // vazio = desenho pelo nome
      })
      setCategorias((lista) => ordenar(lista.map((c) => (c.id === atualizada.id ? atualizada : c))))
      setEditandoId(null)
    } catch (falha) {
      setErroEdicao(Object.values(falha.campos || {})[0] || falha.message) // 409 quando o nome já existe
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
      const nova = await api.adminCriarCategoria({ nome: nomeNova.trim(), cor: null, icone: null })
      setCategorias((lista) => ordenar([...lista, nova]))
      setNomeNova('')
      comecarAEditar(nova) // já abre para escolher a cor e o ícone
    } catch (falha) {
      setErroNova(falha.campos?.nome || falha.message)
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

  // Prévia ao vivo enquanto edita
  const previa = (c) => (editandoId === c.id ? { ...c, nome: edicao.nome, cor: edicao.cor, icone: edicao.icone } : c)

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
            {categorias?.map((original) => {
              const c = previa(original)
              return (
                <li key={c.id}>
                  <span className="fb-mini fb-mini-pequeno" style={{ background: corDaCozinha(c) }} aria-hidden="true">
                    <IconeCozinha nome={c.nome} icone={c.icone} tamanho={26} />
                  </span>
                  {editandoId === c.id ? (
                    <form onSubmit={salvar} className="d-flex flex-column gap-3 flex-grow-1" style={{ flexBasis: '300px' }}>
                      <div>
                        <label htmlFor="editar-nome" className="fb-rotulo">Nome</label>
                        <span className={`fb-campo py-2 ${erroEdicao ? 'fb-campo-erro' : ''}`}>
                          <input id="editar-nome" value={edicao.nome} autoFocus
                            onChange={(e) => setEdicao({ ...edicao, nome: e.target.value })} />
                        </span>
                      </div>

                      <fieldset>
                        <legend className="fb-rotulo">Cor</legend>
                        <div className="fb-escolha-cores">
                          <button type="button" className={`fb-escolha-cor fb-escolha-padrao ${!edicao.cor ? 'marcada' : ''}`}
                            aria-pressed={!edicao.cor} onClick={() => setEdicao({ ...edicao, cor: '' })}>
                            Padrão
                          </button>
                          {CORES.map((cor) => (
                            <button key={cor} type="button" className={`fb-escolha-cor ${edicao.cor === cor ? 'marcada' : ''}`}
                              style={{ background: cor }} aria-pressed={edicao.cor === cor} aria-label={`Cor ${cor}`}
                              onClick={() => setEdicao({ ...edicao, cor })}></button>
                          ))}
                        </div>
                      </fieldset>

                      <fieldset>
                        <legend className="fb-rotulo">Ícone</legend>
                        <div className="fb-escolha-icones">
                          <button type="button" className={`fb-escolha-icone fb-escolha-padrao ${!edicao.icone ? 'marcada' : ''}`}
                            aria-pressed={!edicao.icone} onClick={() => setEdicao({ ...edicao, icone: '' })}
                            title="Escolhe o desenho pelo nome da categoria">
                            Automático
                          </button>
                          {OPCOES_DE_ICONE.map((opcao) => (
                            <button key={opcao.chave} type="button"
                              className={`fb-escolha-icone ${edicao.icone === opcao.chave ? 'marcada' : ''}`}
                              aria-pressed={edicao.icone === opcao.chave} aria-label={opcao.rotulo} title={opcao.rotulo}
                              onClick={() => setEdicao({ ...edicao, icone: opcao.chave })}>
                              <IconeCozinha nome="" icone={opcao.chave} tamanho={24} />
                            </button>
                          ))}
                        </div>
                      </fieldset>

                      {erroEdicao && <div className="fb-erro-campo m-0">{erroEdicao}</div>}
                      <div className="d-flex gap-2 justify-content-end">
                        <button type="button" className="fb-botao fb-botao-claro fb-botao-pequeno"
                          onClick={() => setEditandoId(null)}>Cancelar</button>
                        <button type="submit" className="fb-botao fb-botao-principal fb-botao-pequeno" disabled={salvando}>
                          {salvando ? 'Salvando…' : 'Salvar'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <strong className="flex-grow-1 fs-6" style={{ color: 'var(--fb-tinta)' }}>{c.nome}</strong>
                      <span className="fb-apagado" style={{ minWidth: '8rem', fontSize: '0.95rem' }}>
                        {c.totalRestaurantes === 0 ? 'nenhum restaurante'
                          : `${c.totalRestaurantes} ${c.totalRestaurantes === 1 ? 'restaurante' : 'restaurantes'}`}
                      </span>
                      <button type="button" className="fb-botao fb-botao-claro fb-botao-pequeno"
                        onClick={() => comecarAEditar(c)}>Editar</button>
                      <button type="button" className="fb-botao fb-botao-claro fb-botao-pequeno"
                        onClick={() => excluir(c)} disabled={c.totalRestaurantes > 0}
                        title={c.totalRestaurantes > 0 ? 'Troque a categoria dos restaurantes antes de excluir' : undefined}>
                        Excluir
                      </button>
                    </>
                  )}
                </li>
              )
            })}
          </ul>
        </section>

        <aside className="fb-explicacao">
          <h2>Como surgem categorias novas</h2>
          <p>
            Pelo campo acima, ou quando um restaurante sugere uma categoria que não existe: ela é criada na hora de
            aprovar o cadastro (aba Cadastros).
          </p>
          <p>Em Editar dá para mudar o nome, a cor e o ícone. A mudança vale em todo o site.</p>
          <p>Só dá para excluir uma categoria que nenhum restaurante usa.</p>
        </aside>
      </div>
    </PainelAdmin>
  )
}
