import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import Aviso from '../components/Aviso.jsx'
import Campo from '../components/Campo.jsx'
import TelaAcesso from '../components/TelaAcesso.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import * as api from '../services/apiReal.js'
import {
  erroDeValidacao, temErros, validarCadastro, validarDadosPessoais, validarEmail, validarSenhaNova,
} from '../utils/validacoes.js'

const FORMULARIO_VAZIO = {
  nome: '', username: '', email: '', dataNascimento: '', telefone: '', senha: '', confirmacaoSenha: '',
}

// Textos que mudam conforme o tipo de conta escolhido.
const TEXTOS = {
  cliente: {
    frase: 'que bom te ver por aqui!',
    titulo: 'Avalie, salve favoritos e descubra onde comer.',
    subtitulo: 'Leva um minutinho e já dá para começar a avaliar.',
    botao: 'Criar conta',
  },
  restaurante: {
    frase: 'tem um restaurante?',
    titulo: 'Coloque sua casa no mapa de quem ama comer.',
    subtitulo: 'Primeiro, conta pra gente quem é você.',
    botao: 'Criar conta de restaurante',
  },
}

// Criar conta: cliente (POST /auth/cadastro) ou responsável por restaurante (POST /auth/cadastro-responsavel).
// O responsável não informa data de nascimento. "/cadastro?tipo=restaurante" já abre com essa opção marcada.
export default function Cadastro() {
  const { entrar } = useAuth()
  const navegar = useNavigate()
  const [parametros] = useSearchParams()

  const [tipo, setTipo] = useState(parametros.get('tipo') === 'restaurante' ? 'restaurante' : 'cliente')
  const [dados, setDados] = useState(FORMULARIO_VAZIO)
  const [erro, setErro] = useState(null)
  const [enviando, setEnviando] = useState(false)

  const ehRestaurante = tipo === 'restaurante'
  const textos = TEXTOS[tipo]

  function aoDigitar(evento) {
    setDados({ ...dados, [evento.target.name]: evento.target.value })
  }

  function trocarTipo(novo) {
    setTipo(novo)
    setErro(null)
  }

  async function aoEnviar(evento) {
    evento.preventDefault()
    const errosNaTela = ehRestaurante
      ? { ...validarDadosPessoais(dados), ...validarEmail(dados.email), ...validarSenhaNova(dados.senha, dados.confirmacaoSenha) }
      : validarCadastro(dados)
    if (temErros(errosNaTela)) {
      setErro(erroDeValidacao(errosNaTela))
      return
    }
    setErro(null)
    setEnviando(true)
    try {
      if (ehRestaurante) {
        const { dataNascimento: _semData, ...semData } = dados
        await api.cadastrarResponsavel(semData)
        await entrar(dados.email, dados.senha)
        navegar('/meus-restaurantes', { replace: true }) // o próximo passo é cadastrar o restaurante
      } else {
        await api.cadastrar({ ...dados, dataNascimento: dados.dataNascimento || null })
        await entrar(dados.email, dados.senha)
        navegar('/preferencias', { replace: true }) // conta nova ainda não tem preferências
      }
    } catch (falha) {
      setErro(falha)
    } finally {
      setEnviando(false)
    }
  }

  const campos = erro?.campos || {}

  return (
    <TelaAcesso frase={textos.frase} titulo={textos.titulo}>
      <Link to="/" className="fb-link-discreto"><i className="bi bi-arrow-left" aria-hidden="true"></i> Voltar para o início</Link>

      <div className="fb-abas">
        <Link to="/login" className="fb-aba">Entrar</Link>
        <span className="fb-aba ativa" aria-current="page">Criar conta</span>
      </div>

      <div>
        <h1 className="mb-2">Criar sua conta</h1>
        <p className="fb-subtitulo mb-0">{textos.subtitulo}</p>
      </div>

      <div role="radiogroup" aria-label="Tipo de conta" className="fb-tipos-conta">
        <button type="button" role="radio" aria-checked={!ehRestaurante} className="fb-tipo-conta"
          onClick={() => trocarTipo('cliente')}>
          <span className="fb-icone-suave"><i className="bi bi-person" aria-hidden="true"></i></span>
          <span><strong>Sou cliente</strong><small>Quero avaliar e descobrir</small></span>
        </button>
        <button type="button" role="radio" aria-checked={ehRestaurante} className="fb-tipo-conta"
          onClick={() => trocarTipo('restaurante')}>
          <span className="fb-icone-suave"><i className="bi bi-shop" aria-hidden="true"></i></span>
          <span><strong>Tenho um restaurante</strong><small>Quero cadastrar o meu</small></span>
        </button>
      </div>

      <form onSubmit={aoEnviar} noValidate className="mt-2">
        <Aviso>{erro?.message}</Aviso>

        <Campo rotulo={ehRestaurante ? 'Seu nome completo' : 'Nome completo'} name="nome" icone="bi-person"
          autoComplete="name" placeholder={ehRestaurante ? 'Nome de quem cuida do restaurante' : ''}
          value={dados.nome} onChange={aoDigitar} erro={campos.nome} required />

        <Campo rotulo="Nome de usuário" name="username" icone="bi-at" autoComplete="username"
          value={dados.username} onChange={aoDigitar} erro={campos.username}
          ajuda="Só letras, números, ponto e sublinhado." required />

        {ehRestaurante ? (
          <div className="row g-3">
            <div className="col-sm-6">
              <Campo rotulo="E-mail" name="email" type="email" icone="bi-envelope" placeholder="contato@restaurante.com"
                autoComplete="email" value={dados.email} onChange={aoDigitar} erro={campos.email} required />
            </div>
            <div className="col-sm-6">
              <Campo rotulo="Telefone" name="telefone" type="tel" icone="bi-telephone" placeholder="(13) 3333-0000"
                autoComplete="tel" value={dados.telefone} onChange={aoDigitar} erro={campos.telefone} required />
            </div>
          </div>
        ) : (
          <>
            <Campo rotulo="E-mail" name="email" type="email" icone="bi-envelope" placeholder="seu@email.com"
              autoComplete="email" value={dados.email} onChange={aoDigitar} erro={campos.email} required />

            <div className="row g-3">
              <div className="col-sm-6">
                <Campo rotulo="Data de nascimento" name="dataNascimento" type="date" icone="bi-calendar3"
                  value={dados.dataNascimento} onChange={aoDigitar} erro={campos.dataNascimento} required />
              </div>
              <div className="col-sm-6">
                <Campo rotulo="Telefone" name="telefone" type="tel" icone="bi-telephone" placeholder="(13) 99999-0000"
                  autoComplete="tel" value={dados.telefone} onChange={aoDigitar} erro={campos.telefone} required />
              </div>
            </div>
          </>
        )}

        <Campo rotulo="Senha" name="senha" type="password" icone="bi-lock" autoComplete="new-password"
          value={dados.senha} onChange={aoDigitar} erro={campos.senha} ajuda="No mínimo 8 caracteres." required />

        <Campo rotulo="Confirmar senha" name="confirmacaoSenha" type="password" icone="bi-lock"
          autoComplete="new-password" value={dados.confirmacaoSenha} onChange={aoDigitar}
          erro={campos.confirmacaoSenha} required />

        {ehRestaurante && (
          <Aviso tipo="info">
            Depois de criar a conta você cadastra o restaurante (com CNPJ). Ele aparece no site assim que a equipe
            FourBites aprovar.
          </Aviso>
        )}

        <button type="submit" className="fb-botao fb-botao-principal w-100 mt-2" disabled={enviando}>
          {enviando ? 'Criando conta…' : textos.botao}
        </button>
      </form>

      <p className="text-center mb-0">
        Já tem conta? <Link to="/login" className="fb-sublinhado-leve">Entrar</Link>
      </p>
    </TelaAcesso>
  )
}
