import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import Aviso from '../components/Aviso.jsx'
import Campo from '../components/Campo.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import * as api from '../services/apiReal.js'

const FORMULARIO_VAZIO = {
  nome: '', username: '', email: '', dataNascimento: '', telefone: '', senha: '', confirmacaoSenha: '',
}

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
    setErro(null)
    setEnviando(true)
    try {
      await api.cadastrar({ ...dados, dataNascimento: dados.dataNascimento || null })
      await entrar(dados.email, dados.senha) 
      navegar('/explorar', { replace: true })
    } catch (falha) {
      setErro(falha)
    } finally {
      setEnviando(false)
    }
  }

  const campos = erro?.campos || {}

  return (
    <div className="fb-pagina-estreita">
      <Link to="/login" className="fb-link-discreto"><i className="bi bi-arrow-left" aria-hidden="true"></i> Voltar</Link>

      <div className="text-center my-4">
        <span className="fb-logo fb-logo-grande"><i className="bi bi-fork-knife" aria-hidden="true"></i></span>
        <h1 className="mt-3">Criar conta</h1>
        <p className="fb-subtitulo">Comece a avaliar e descobrir restaurantes.</p>
      </div>

      <form onSubmit={aoEnviar} className="fb-cartao p-4" noValidate>
        <Aviso>{erro?.message}</Aviso>

        <Campo rotulo="Nome completo" name="nome" icone="bi-person" autoComplete="name"
          value={dados.nome} onChange={aoDigitar} erro={campos.nome} required />

        <Campo rotulo="Nome de usuário" name="username" icone="bi-at" autoComplete="username"
          value={dados.username} onChange={aoDigitar} erro={campos.username}
          ajuda="Só letras, números, ponto e sublinhado." required />

        <Campo rotulo="E-mail" name="email" type="email" icone="bi-envelope" autoComplete="email"
          value={dados.email} onChange={aoDigitar} erro={campos.email} required />

        <div className="row">
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

      <p className="text-center mt-3">
        Já tem conta? <Link to="/login" className="fb-link">Entrar</Link>
      </p>
    </div>
  )
}
