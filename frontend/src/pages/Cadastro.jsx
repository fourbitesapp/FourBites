import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import Aviso from '../components/Aviso.jsx'
import Campo from '../components/Campo.jsx'
import TelaAcesso from '../components/TelaAcesso.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import * as api from '../services/apiReal.js'
import { erroDeValidacao, temErros, validarCadastro } from '../utils/validacoes.js'

const FORMULARIO_VAZIO = {
  nome: '', username: '', email: '', dataNascimento: '', telefone: '', senha: '', confirmacaoSenha: '',
}

// Criar conta de cliente: mesmo molde da tela de entrar.
export default function Cadastro() {
  const { entrar } = useAuth()
  const navegar = useNavigate()

  const [dados, setDados] = useState(FORMULARIO_VAZIO)
  const [erro, setErro] = useState(null)
  const [enviando, setEnviando] = useState(false)

  function aoDigitar(evento) {
    setDados({ ...dados, [evento.target.name]: evento.target.value })
  }

  async function aoEnviar(evento) {
    evento.preventDefault()
    const errosNaTela = validarCadastro(dados)
    if (temErros(errosNaTela)) {
      setErro(erroDeValidacao(errosNaTela))
      return
    }
    setErro(null)
    setEnviando(true)
    try {
      await api.cadastrar({ ...dados, dataNascimento: dados.dataNascimento || null })
      await entrar(dados.email, dados.senha)
      navegar('/preferencias', { replace: true }) // conta nova ainda não tem preferências
    } catch (falha) {
      setErro(falha)
    } finally {
      setEnviando(false)
    }
  }

  const campos = erro?.campos || {}

  return (
    <TelaAcesso frase="que bom te ver por aqui!" titulo="Avalie, salve favoritos e descubra onde comer.">
      <div className="fb-abas">
        <Link to="/login" className="fb-aba">Entrar</Link>
        <span className="fb-aba ativa" aria-current="page">Criar conta</span>
      </div>

      <div>
        <h1 className="mb-2">Criar sua conta</h1>
        <p className="fb-subtitulo mb-0">Leva um minutinho e já dá para começar a avaliar.</p>
      </div>

      <form onSubmit={aoEnviar} noValidate className="mt-2">
        <Aviso>{erro?.message}</Aviso>

        <Campo rotulo="Nome completo" name="nome" icone="bi-person" autoComplete="name"
          value={dados.nome} onChange={aoDigitar} erro={campos.nome} required />

        <Campo rotulo="Nome de usuário" name="username" icone="bi-at" autoComplete="username"
          value={dados.username} onChange={aoDigitar} erro={campos.username}
          ajuda="Só letras, números, ponto e sublinhado." required />

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

        <Campo rotulo="Senha" name="senha" type="password" icone="bi-lock" autoComplete="new-password"
          value={dados.senha} onChange={aoDigitar} erro={campos.senha} ajuda="No mínimo 8 caracteres." required />

        <Campo rotulo="Confirmar senha" name="confirmacaoSenha" type="password" icone="bi-lock"
          autoComplete="new-password" value={dados.confirmacaoSenha} onChange={aoDigitar}
          erro={campos.confirmacaoSenha} required />

        <button type="submit" className="fb-botao fb-botao-principal w-100 mt-2" disabled={enviando}>
          {enviando ? 'Criando conta…' : 'Criar conta'}
        </button>
      </form>

      <p className="text-center mb-0">
        Já tem conta? <Link to="/login" className="fb-sublinhado-leve">Entrar</Link>
      </p>
    </TelaAcesso>
  )
}
