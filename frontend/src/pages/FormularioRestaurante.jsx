import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import AreaRestrita from '../components/AreaRestrita.jsx'
import Aviso from '../components/Aviso.jsx'
import BarraNavegacao from '../components/BarraNavegacao.jsx'
import Campo from '../components/Campo.jsx'
import Interruptor from '../components/Interruptor.jsx'
import Rodape from '../components/Rodape.jsx'
import Seletor from '../components/Seletor.jsx'
import * as api from '../services/apiReal.js'
import {
  CARACTERISTICAS, DIAS_DA_SEMANA, FAIXAS_DE_PRECO, formularioDoRestaurante, formularioVazio, montarEnvio, podeEditar, validarFormulario,
} from '../utils/restaurantes.js'
import { conferirImagem, erroDeValidacao, TAMANHO_MAXIMO_ARQUIVO, temErros } from '../utils/validacoes.js'

// Um formulário para três situações (prop "modo"):
//  - "novo":   o responsável cadastra um restaurante  → POST /meus-restaurantes (fica em análise)
//  - "editar": o responsável edita ou corrige um seu → PUT /meus-restaurantes/{id}
//  - "admin":  o admin cadastra direto → POST /admin/restaurantes (já entra publicado)
export default function FormularioRestaurante({ modo }) {
  return (
    <AreaRestrita papel={modo === 'admin' ? 'ADMIN' : 'RESTAURANTE'}>
      <Formulario modo={modo} />
    </AreaRestrita>
  )
}

// Os textos do topo e da faixa de envio mudam conforme o modo e a situação do cadastro.
function textosDaTela(modo, restaurante) {
  if (modo === 'admin') {
    return {
      mao: 'cadastro direto',
      titulo: 'Cadastrar restaurante',
      subtitulo: 'Cadastro feito pela equipe FourBites: o restaurante já entra publicado e fica sem responsável.',
      avisoEnvio: 'Ao salvar, o restaurante aparece no site na hora.',
      botao: 'Cadastrar e publicar',
      depois: 'Restaurante cadastrado e publicado.',
    }
  }
  if (modo === 'novo') {
    return {
      mao: 'bem-vindo à mesa!',
      titulo: 'Cadastrar restaurante',
      subtitulo: 'Preencha com calma. Depois de enviar, a equipe FourBites confere tudo antes de publicar.',
      avisoEnvio: 'Ao enviar, o cadastro fica “Em análise” e aparece no site depois da aprovação.',
      botao: 'Enviar para análise',
      depois: 'Cadastro enviado! Agora é só esperar a análise da equipe.',
    }
  }
  if (restaurante?.status === 'REJEITADO') {
    return {
      mao: 'quase lá!',
      titulo: `Corrigir ${restaurante.nome}`,
      subtitulo: 'Ajuste o que a equipe pediu e envie de novo.',
      avisoEnvio: 'Ao reenviar, o cadastro volta para “Em análise”.',
      botao: 'Reenviar para análise',
      depois: 'Cadastro reenviado para análise.',
    }
  }
  return {
    mao: 'mudou alguma coisa?',
    titulo: `Editar ${restaurante?.nome || ''}`,
    subtitulo: 'As mudanças passam pela análise da equipe. Até lá, o site continua mostrando a versão atual.',
    avisoEnvio: 'Enquanto as mudanças estiverem em análise, não dá para editar de novo.',
    botao: 'Enviar mudanças',
    depois: 'Mudanças enviadas para análise.',
  }
}

// Campos que já mostram o próprio erro na tela; os outros aparecem na lista perto do botão de enviar.
const ERROS_NA_TELA = ['nome', 'cnpj', 'telefone', 'categoriaId', 'categoriaSugerida', 'dataFundacao', 'descricao',
  'endereco', 'endereco.cep', 'endereco.logradouro', 'endereco.numero', 'endereco.complemento', 'endereco.bairro',
  'endereco.cidade', 'endereco.uf', 'faixaPreco', 'fotos', 'cardapioUrl', 'cardapioLink']

function Formulario({ modo }) {
  const { id } = useParams()
  const navegar = useNavigate()
  const seletorDeFotos = useRef(null)
  const seletorDeCardapio = useRef(null)

  const [restaurante, setRestaurante] = useState(null) // só no modo "editar"
  const [form, setForm] = useState(formularioVazio)
  const [categorias, setCategorias] = useState([])
  const [formas, setFormas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erroCarregar, setErroCarregar] = useState(null)

  const [erro, setErro] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [enviandoFotos, setEnviandoFotos] = useState(false)
  const [enviandoCardapio, setEnviandoCardapio] = useState(false)
  const [erroArquivo, setErroArquivo] = useState({})
  const [situacaoCep, setSituacaoCep] = useState('') // '', 'buscando' ou a mensagem de CEP não encontrado

  // Carrega as listas de opções e, ao editar, o restaurante.
  useEffect(() => {
    const buscas = [api.listarCategorias(), api.listarFormasPagamento()]
    if (modo === 'editar') buscas.push(api.buscarMeuRestaurante(id))
    Promise.all(buscas)
      .then(([listaCategorias, listaFormas, meu]) => {
        setCategorias(listaCategorias)
        setFormas(listaFormas)
        if (meu) {
          setRestaurante(meu)
          setForm(formularioDoRestaurante(meu))
        }
      })
      .catch(setErroCarregar)
      .finally(() => setCarregando(false))
  }, [modo, id])

  const textos = textosDaTela(modo, restaurante)
  const voltarPara = modo === 'admin' ? '/admin/restaurantes' : '/meus-restaurantes'
  const cnpjTravado = modo === 'editar' // o CNPJ não muda depois do cadastro
  const campos = erro?.campos || {}

  // ---------- Atualizar o formulário ----------

  function mudar(campo, valor) {
    setForm((atual) => ({ ...atual, [campo]: valor }))
  }

  function mudarEndereco(campo, valor) {
    setForm((atual) => ({ ...atual, endereco: { ...atual.endereco, [campo]: valor } }))
  }

  function mudarDia(indice, mudancas) {
    setForm((atual) => ({ ...atual, dias: atual.dias.map((d, i) => (i === indice ? { ...d, ...mudancas } : d)) }))
  }

  function mudarPeriodo(indiceDia, indicePeriodo, campo, valor) {
    const dia = form.dias[indiceDia]
    mudarDia(indiceDia, { periodos: dia.periodos.map((p, i) => (i === indicePeriodo ? { ...p, [campo]: valor } : p)) })
  }

  function alternarForma(formaId) {
    const ids = form.formasPagamentoIds
    mudar('formasPagamentoIds', ids.includes(formaId) ? ids.filter((f) => f !== formaId) : [...ids, formaId])
  }

  // CEP com 8 números: busca rua, bairro, cidade e UF no ViaCEP (serviço público dos Correios).
  // Se não achar, a pessoa preenche à mão. O mapa (latitude/longitude) quem calcula é o back-end.
  async function aoMudarCep(valor) {
    mudarEndereco('cep', valor)
    const numeros = valor.replace(/\D/g, '')
    if (numeros.length !== 8) {
      setSituacaoCep('')
      return
    }
    setSituacaoCep('buscando')
    try {
      const resposta = await fetch(`https://viacep.com.br/ws/${numeros}/json/`)
      const dados = await resposta.json()
      if (dados.erro) throw new Error()
      setForm((atual) => ({
        ...atual,
        endereco: {
          ...atual.endereco,
          logradouro: dados.logradouro || atual.endereco.logradouro,
          bairro: dados.bairro || atual.endereco.bairro,
          cidade: dados.localidade || atual.endereco.cidade,
          uf: dados.uf || atual.endereco.uf,
        },
      }))
      setSituacaoCep('')
    } catch {
      setSituacaoCep('Não achamos esse CEP. Preencha o endereço à mão.')
    }
  }

  // ---------- Arquivos (enviados na hora para POST /uploads; o formulário guarda só os endereços) ----------

  async function adicionarFotos(evento) {
    const escolhidas = Array.from(evento.target.files)
    evento.target.value = ''
    setErroArquivo({})
    for (const arquivo of escolhidas) {
      const problema = conferirImagem(arquivo)
      if (problema) {
        setErroArquivo({ fotos: `${arquivo.name}: ${problema}` })
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
      setForm((atual) => ({ ...atual, fotos: [...atual.fotos, ...novas] }))
    } catch (falha) {
      setErroArquivo({ fotos: falha.campos?.arquivo || falha.message })
    } finally {
      setEnviandoFotos(false)
    }
  }

  async function enviarCardapio(evento) {
    const arquivo = evento.target.files[0]
    evento.target.value = ''
    setErroArquivo({})
    if (!arquivo) return
    if (!['application/pdf', 'image/jpeg', 'image/png'].includes(arquivo.type)) {
      setErroArquivo({ cardapio: 'Envie o cardápio em PDF, JPG ou PNG.' })
      return
    }
    if (arquivo.size > TAMANHO_MAXIMO_ARQUIVO) {
      setErroArquivo({ cardapio: 'O arquivo deve ter no máximo 5 MB.' })
      return
    }
    setEnviandoCardapio(true)
    try {
      const { url } = await api.enviarArquivo(arquivo)
      mudar('cardapioUrl', url)
    } catch (falha) {
      setErroArquivo({ cardapio: falha.campos?.arquivo || falha.message })
    } finally {
      setEnviandoCardapio(false)
    }
  }

  // ---------- Enviar ----------

  async function aoEnviar(evento) {
    evento.preventDefault()
    const errosNaTela = validarFormulario(form, { cnpjObrigatorio: modo === 'novo' })
    if (temErros(errosNaTela)) {
      setErro(erroDeValidacao(errosNaTela))
      return
    }
    setErro(null)
    setEnviando(true)
    try {
      const corpo = montarEnvio(form)
      if (modo === 'admin') await api.adminCadastrarRestaurante(corpo)
      else if (modo === 'novo') await api.cadastrarMeuRestaurante(corpo)
      else await api.editarMeuRestaurante(id, corpo)
      navegar(voltarPara, { state: { aviso: textos.depois } })
    } catch (falha) {
      setErro(falha)
    } finally {
      setEnviando(false)
    }
  }

  // ---------- Tela ----------

  if (carregando || erroCarregar) {
    return (
      <>
        <BarraNavegacao />
        <main className="fb-pagina-media">
          {erroCarregar ? <Aviso>{erroCarregar.message}</Aviso> : <p className="fb-vazio">Carregando…</p>}
          {erroCarregar && <Link to={voltarPara} className="fb-link">Voltar</Link>}
        </main>
        <Rodape />
      </>
    )
  }

  // Ao editar: se o cadastro ou uma mudança está em análise, o back-end recusa a edição.
  if (restaurante && !podeEditar(restaurante)) {
    return (
      <>
        <BarraNavegacao />
        <main className="fb-pagina-media">
          <Aviso tipo="info">
            {restaurante.nome} está em análise pela equipe FourBites. A edição fica liberada depois da análise.
          </Aviso>
          <Link to="/meus-restaurantes" className="fb-link">Voltar para Meus restaurantes</Link>
        </main>
        <Rodape />
      </>
    )
  }

  const motivo = restaurante?.status === 'REJEITADO'
    ? restaurante.motivoRejeicao
    : restaurante?.alteracaoPendente?.status === 'REJEITADO' ? restaurante.alteracaoPendente.motivoRejeicao : null

  const opcoesCategoria = [
    { valor: '', rotulo: 'Escolha a categoria' },
    ...categorias.map((c) => ({ valor: c.id, rotulo: c.nome })),
    { valor: 'outra', rotulo: 'Outra categoria' },
  ]
  const errosHorario = Object.entries(campos).filter(([chave]) => chave.startsWith('horarios')).map(([, m]) => m)
  const outrosErros = Object.entries(campos)
    .filter(([chave]) => !ERROS_NA_TELA.includes(chave) && !chave.startsWith('horarios'))
    .map(([, mensagem]) => mensagem)

  return (
    <>
      <BarraNavegacao />
      <main className="fb-pagina-media">
        <span className="fb-mao d-block">{textos.mao}</span>
        <h1 className="mt-3">{textos.titulo}</h1>
        <p className="fb-subtitulo">{textos.subtitulo}</p>

        {motivo && (
          <div className="fb-recado fb-recado-vermelho mt-3">
            <strong>O que a equipe pediu:</strong>
            {motivo}
          </div>
        )}

        <form onSubmit={aoEnviar} noValidate className="d-flex flex-column gap-4 mt-4">
          <Aviso>{erro?.message}</Aviso>

          {/* 1. Sobre */}
          <section className="fb-caixa">
            <div className="fb-passo-titulo"><span className="fb-numero">1</span><h2>Sobre o restaurante</h2></div>
            <Campo rotulo="Nome do restaurante" name="nome" value={form.nome}
              onChange={(e) => mudar('nome', e.target.value)} erro={campos.nome} required />
            <div className="row g-3">
              <div className="col-md-6">
                {cnpjTravado ? (
                  <div className="mb-4">
                    <label htmlFor="cnpj" className="fb-rotulo">CNPJ</label>
                    <div className="fb-campo fb-campo-travado"><input id="cnpj" value={form.cnpj} disabled /></div>
                    <div className="fb-ajuda">O CNPJ não muda depois do cadastro.</div>
                  </div>
                ) : (
                  <Campo rotulo={modo === 'admin' ? 'CNPJ (opcional)' : 'CNPJ'} name="cnpj" placeholder="00.000.000/0000-00"
                    inputMode="numeric" value={form.cnpj} onChange={(e) => mudar('cnpj', e.target.value)}
                    erro={campos.cnpj} />
                )}
              </div>
              <div className="col-md-6">
                <Campo rotulo="Telefone" name="telefone" type="tel" placeholder="(13) 3333-0000" value={form.telefone}
                  onChange={(e) => mudar('telefone', e.target.value)} erro={campos.telefone} required />
              </div>
              <div className="col-md-6">
                <div className="mb-4">
                  <span className="fb-rotulo">Categoria</span>
                  <Seletor rotulo="Categoria" valor={form.categoriaId} opcoes={opcoesCategoria}
                    aoMudar={(valor) => mudar('categoriaId', valor)} />
                  {campos.categoriaId && <div className="fb-erro-campo">{campos.categoriaId}</div>}
                </div>
              </div>
              <div className="col-md-6">
                {form.categoriaId === 'outra' && (
                  <Campo rotulo="Qual categoria?" name="categoriaSugerida" value={form.categoriaSugerida}
                    onChange={(e) => mudar('categoriaSugerida', e.target.value)} erro={campos.categoriaSugerida}
                    ajuda="A equipe cria a categoria ou escolhe uma parecida." />
                )}
              </div>
              <div className="col-md-6">
                <Campo rotulo="Abriu em" name="abriuEm" type="month" value={form.abriuEm}
                  max={new Date().toISOString().slice(0, 7)} onChange={(e) => mudar('abriuEm', e.target.value)}
                  erro={campos.dataFundacao} ajuda="Mês e ano." />
              </div>
            </div>
            <label htmlFor="descricao" className="fb-rotulo">Descrição</label>
            <textarea id="descricao" className="fb-area-texto" rows="4" value={form.descricao}
              onChange={(e) => mudar('descricao', e.target.value)} aria-invalid={Boolean(campos.descricao)} />
            {campos.descricao && <div className="fb-erro-campo">{campos.descricao}</div>}
          </section>

          {/* 2. Endereço */}
          <section className="fb-caixa">
            <div className="fb-passo-titulo"><span className="fb-numero">2</span><h2>Onde fica</h2></div>
            <div className="row g-3">
              <div className="col-md-4">
                <Campo rotulo="CEP" name="cep" inputMode="numeric" placeholder="00000-000" value={form.endereco.cep}
                  onChange={(e) => aoMudarCep(e.target.value)} erro={campos['endereco.cep']}
                  ajuda={situacaoCep === 'buscando' ? 'Buscando endereço…' : situacaoCep || 'Preenche a rua sozinho.'} />
              </div>
              <div className="col-md-8">
                <Campo rotulo="Rua / avenida" name="logradouro" value={form.endereco.logradouro}
                  onChange={(e) => mudarEndereco('logradouro', e.target.value)} erro={campos['endereco.logradouro']} />
              </div>
              <div className="col-md-4">
                <Campo rotulo="Número" name="numero" value={form.endereco.numero}
                  onChange={(e) => mudarEndereco('numero', e.target.value)} erro={campos['endereco.numero']} />
              </div>
              <div className="col-md-8">
                <Campo rotulo="Complemento (opcional)" name="complemento" placeholder="Loja, sala, andar"
                  value={form.endereco.complemento} onChange={(e) => mudarEndereco('complemento', e.target.value)}
                  erro={campos['endereco.complemento']} />
              </div>
              <div className="col-md-5">
                <Campo rotulo="Bairro" name="bairro" value={form.endereco.bairro}
                  onChange={(e) => mudarEndereco('bairro', e.target.value)} erro={campos['endereco.bairro']} />
              </div>
              <div className="col-8 col-md-5">
                <Campo rotulo="Cidade" name="cidade" value={form.endereco.cidade}
                  onChange={(e) => mudarEndereco('cidade', e.target.value)} erro={campos['endereco.cidade']} />
              </div>
              <div className="col-4 col-md-2">
                <Campo rotulo="UF" name="uf" maxLength={2} value={form.endereco.uf}
                  onChange={(e) => mudarEndereco('uf', e.target.value)} erro={campos['endereco.uf']} />
              </div>
            </div>
            {campos.endereco && <Aviso>{campos.endereco}</Aviso>}
            <p className="fb-dica-azul">
              <i className="bi bi-geo-alt" aria-hidden="true"></i> O pino no mapa é colocado a partir desse endereço.
            </p>
          </section>

          {/* 3. Horários */}
          <section className="fb-caixa">
            <div className="fb-passo-titulo"><span className="fb-numero">3</span><h2>Horário de funcionamento</h2></div>
            {form.dias.map((dia, i) => (
              <div key={DIAS_DA_SEMANA[i]} className="fb-dia">
                <strong className="fb-dia-nome">{DIAS_DA_SEMANA[i]}</strong>
                <Interruptor ligado={dia.aberto} textoLigado="Aberto" textoDesligado="Fechado"
                  rotulo={`${DIAS_DA_SEMANA[i]} aberto`} aoMudar={(aberto) => mudarDia(i, { aberto })} />
                {dia.aberto && (
                  <span className="d-flex flex-wrap align-items-center gap-2 flex-grow-1">
                    {dia.periodos.map((p, j) => (
                      <span key={j} className="d-inline-flex align-items-center gap-2">
                        <input type="time" className="fb-hora" value={p.abertura} aria-label={`${DIAS_DA_SEMANA[i]}: abre às`}
                          onChange={(e) => mudarPeriodo(i, j, 'abertura', e.target.value)} />
                        <span>até</span>
                        <input type="time" className="fb-hora" value={p.fechamento} aria-label={`${DIAS_DA_SEMANA[i]}: fecha às`}
                          onChange={(e) => mudarPeriodo(i, j, 'fechamento', e.target.value)} />
                        {dia.periodos.length > 1 && (
                          <button type="button" className="fb-botao-texto fb-apagado" aria-label="Tirar este horário"
                            onClick={() => mudarDia(i, { periodos: dia.periodos.filter((_, k) => k !== j) })}>
                            <i className="bi bi-x-lg" aria-hidden="true"></i>
                          </button>
                        )}
                      </span>
                    ))}
                    <button type="button" className="fb-botao-texto fb-link"
                      onClick={() => mudarDia(i, { periodos: [...dia.periodos, { abertura: '', fechamento: '' }] })}>
                      + outro horário
                    </button>
                  </span>
                )}
              </div>
            ))}
            {(campos.horarios || errosHorario.length > 0) && (
              <div className="fb-erro-campo ms-0">{campos.horarios || errosHorario[0]}</div>
            )}
            <p className="fb-ajuda ms-0 mt-3">Fecha depois da meia-noite? É só colocar, por exemplo, 18:00 até 01:00.</p>
          </section>

          {/* 4. Preço e pagamento */}
          <section className="fb-caixa">
            <div className="fb-passo-titulo"><span className="fb-numero">4</span><h2>Preço e pagamento</h2></div>
            <span className="fb-rotulo">Faixa de preço</span>
            <div role="radiogroup" aria-label="Faixa de preço" className="fb-precos fb-precos-3">
              {FAIXAS_DE_PRECO.map((faixa) => (
                <button key={faixa.valor} type="button" role="radio" aria-checked={form.faixaPreco === faixa.valor}
                  className={`fb-preco ${form.faixaPreco === faixa.valor ? 'ativo' : ''}`}
                  onClick={() => mudar('faixaPreco', faixa.valor)}>
                  <strong>{faixa.valor}</strong><span className="fw-bold">{faixa.rotulo}</span>
                </button>
              ))}
            </div>
            {campos.faixaPreco && <div className="fb-erro-campo">{campos.faixaPreco}</div>}

            <span className="fb-rotulo mt-4">Formas de pagamento</span>
            <div className="d-flex flex-wrap gap-2">
              {formas.map((forma) => {
                const marcada = form.formasPagamentoIds.includes(forma.id)
                return (
                  <button key={forma.id} type="button" aria-pressed={marcada} className={`fb-chip ${marcada ? 'ativo' : ''}`}
                    onClick={() => alternarForma(forma.id)}>
                    {forma.nome}{marcada && <i className="bi bi-check-lg" aria-hidden="true"></i>}
                  </button>
                )
              })}
            </div>
          </section>

          {/* 5. Comodidades */}
          <section className="fb-caixa">
            <div className="fb-passo-titulo"><span className="fb-numero">5</span><h2>Comodidades</h2></div>
            <div className="fb-extras">
              {CARACTERISTICAS.map((c) => (
                <Comodidade key={c.campo} icone={c.icone} cor={c.cor} titulo={c.rotulo} texto={c.texto}
                  ligado={form[c.campo]} aoMudar={(valor) => mudar(c.campo, valor)} />
              ))}
            </div>
          </section>

          {/* 6. Fotos e cardápio */}
          <section className="fb-caixa">
            <div className="fb-passo-titulo"><span className="fb-numero">6</span><h2>Fotos e cardápio</h2></div>
            <span className="fb-rotulo">Fotos do restaurante</span>
            <div className="d-flex flex-wrap gap-3 mt-1">
              {form.fotos.map((url, i) => (
                <div key={url} className="fb-foto-restaurante">
                  <img src={url} alt={`Foto ${i + 1}`} />
                  {i === 0 && <span className="fb-etiqueta-capa">Capa</span>}
                  <button type="button" aria-label={`Tirar foto ${i + 1}`}
                    onClick={() => mudar('fotos', form.fotos.filter((f) => f !== url))}>
                    <i className="bi bi-x" aria-hidden="true"></i>
                  </button>
                </div>
              ))}
              <input ref={seletorDeFotos} type="file" accept="image/jpeg,image/png" multiple hidden onChange={adicionarFotos} />
              <button type="button" className="fb-adicionar-foto" disabled={enviandoFotos}
                onClick={() => seletorDeFotos.current.click()}>
                <span className="fb-icone-suave"><i className="bi bi-plus-lg" aria-hidden="true"></i></span>
                {enviandoFotos ? 'Enviando…' : 'Adicionar'}
              </button>
            </div>
            {(erroArquivo.fotos || campos.fotos) && <div className="fb-erro-campo ms-0">{erroArquivo.fotos || campos.fotos}</div>}
            <p className="fb-ajuda ms-0 mt-2">JPG ou PNG, até 5 MB cada. A primeira foto vira a capa.</p>

            <span className="fb-rotulo mt-4">Cardápio <span className="fw-normal fb-apagado">(opcional, um ou os dois)</span></span>
            <div className="row g-3 align-items-start fb-cardapio">
              <div className="col-md-6">
                <span className="fb-rotulo">Arquivo do cardápio</span>
                <input ref={seletorDeCardapio}type="file" accept="application/pdf,image/jpeg,image/png" hidden
                  onChange={enviarCardapio} />
                <div className="fb-arquivo">
                  <span className="fb-arquivo-icone">{form.cardapioUrl ? 'OK' : 'PDF'}</span>
                  <span className="flex-grow-1">
                    {form.cardapioUrl
                      ? <a href={form.cardapioUrl} target="_blank" rel="noreferrer" className="fb-link">Ver arquivo enviado</a>
                      : <strong className="d-block" style={{ color: 'var(--fb-tinta)' }}>Nenhum arquivo</strong>}
                    <small className="d-block fb-apagado">PDF, JPG ou PNG, até 5 MB</small>
                  </span>
                  <button type="button" className="fb-botao fb-botao-claro fb-botao-pequeno" disabled={enviandoCardapio}
                    onClick={() => seletorDeCardapio.current.click()}>
                    {enviandoCardapio ? 'Enviando…' : form.cardapioUrl ? 'Trocar' : 'Enviar'}
                  </button>
                  {form.cardapioUrl && (
                    <button type="button" className="fb-botao-texto fb-apagado" aria-label="Tirar o arquivo do cardápio"
                      onClick={() => mudar('cardapioUrl', '')}>
                      <i className="bi bi-x-lg" aria-hidden="true"></i>
                    </button>
                  )}
                </div>
                {(erroArquivo.cardapio || campos.cardapioUrl) && (
                  <div className="fb-erro-campo">{erroArquivo.cardapio || campos.cardapioUrl}</div>
                )}
              </div>
              <div className="col-md-6">
                <Campo rotulo="Link do cardápio" name="cardapioLink" type="url" placeholder="https://… (site, iFood, Instagram)"
                  value={form.cardapioLink} onChange={(e) => mudar('cardapioLink', e.target.value)} erro={campos.cardapioLink} />
              </div>
            </div>
          </section>

          {/* Envio */}
          <div className="fb-faixa-envio mt-0">
            <div>
              <p>{textos.avisoEnvio}</p>
              {erro && <Aviso>{erro.message}</Aviso>}
              {outrosErros.length > 0 && (
                <ul className="fb-erro-campo ms-0 mb-0 ps-3">{outrosErros.map((m) => <li key={m}>{m}</li>)}</ul>
              )}
            </div>
            <div className="d-flex gap-2">
              <Link to={voltarPara} className="fb-botao fb-botao-claro">Cancelar</Link>
              <button type="submit" className="fb-botao fb-botao-principal" disabled={enviando || enviandoFotos || enviandoCardapio}>
                {enviando ? 'Enviando…' : textos.botao}
              </button>
            </div>
          </div>
        </form>
      </main>
      <Rodape />
    </>
  )
}

function Comodidade({ icone, cor, titulo, texto, ligado, aoMudar }) {
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