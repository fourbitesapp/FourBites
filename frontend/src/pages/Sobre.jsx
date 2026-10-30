import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import mascote from '../assets/mascote.webp'
import Avatar from '../components/Avatar.jsx'
import BarraNavegacao from '../components/BarraNavegacao.jsx'
import Rodape from '../components/Rodape.jsx'
import * as api from '../services/apiReal.js'

// Página "Sobre nós" (link só no rodapé): o que é o FourBites, quem é o Farelo e que é um projeto de TCC.

// Nome de usuário (o que vem depois do @) de quem fez o projeto e da conta do Farelo.
// O nome e a foto de cada um vêm do próprio perfil no site.
const INTEGRANTES = ['giovannamelgares', 'juliarodrigues', 'gabrielsouza']
const USERNAME_FARELO = 'farelo'
const ORIENTADOR = 'Davi Silvreste Moreira dos Reis'

const RECURSOS = [
  { icone: 'bi-search', cor: '#b5dcf8', titulo: 'Descobrir',
    texto: 'Busque por nome, cozinha ou bairro, use os filtros e veja os restaurantes no mapa.' },
  { icone: 'bi-star', cor: '#ffb8c8', titulo: 'Avaliar',
    texto: 'Dê notas de 1 a 5 para comida, ambiente, atendimento e custo-benefício, com comentário e fotos.' },
  { icone: 'bi-heart', cor: '#ffd98a', titulo: 'Recomendações',
    texto: 'O site mostra o quanto cada lugar combina com você, pelas suas preferências e pelo que você já avaliou.' },
  { icone: 'bi-people', cor: '#a8e2c2', titulo: 'Listas e pessoas',
    texto: 'Monte listas, escolha seus 4 favoritos e siga pessoas e listas para ver o que elas andam comendo.' },
]

export default function Sobre() {
  return (
    <>
      <BarraNavegacao />
      <main className="fb-conteudo">
        {/* Apresentação */}
        <section className="fb-sobre-topo">
          <span className="fb-mao" style={{ fontSize: '2.1rem' }}>prazer, FourBites!</span>
          <h1>Um lugar pra descobrir onde comer e contar como foi.</h1>
          <p>
            O FourBites é uma plataforma de avaliação e descoberta de restaurantes. Aqui você encontra lugares em
            Santos, lê o que outras pessoas acharam e deixa a sua avaliação. São avaliações orgânicas, sem conteúdo
            patrocinado.
          </p>
          <Link to="/explorar" className="fb-botao fb-botao-principal align-self-start">Explorar restaurantes</Link>
        </section>

        {/* O que dá pra fazer */}
        <section className="fb-secao">
          <div className="fb-secao-topo">
            <div>
              <h2 className="mb-0">O que dá pra fazer aqui</h2>
              <p className="fb-apagado">Tudo gira em torno de comer bem e dividir a experiência.</p>
            </div>
          </div>
          <div className="fb-sobre-recursos">
            {RECURSOS.map((r) => (
              <div key={r.titulo} className="fb-sobre-recurso">
                <span className="fb-sobre-icone" style={{ background: r.cor }}>
                  <i className={`bi ${r.icone}`} aria-hidden="true"></i>
                </span>
                <strong>{r.titulo}</strong>
                <span>{r.texto}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Farelo */}
        <section className="fb-secao fb-sobre-farelo">
          <div className="fb-sobre-farelo-arte">
            <img src={mascote} alt="Farelo, o mascote do FourBites" />
          </div>
          <div className="fb-sobre-farelo-texto">
            <span className="fb-mao">oi, eu sou o Farelo!</span>
            <h2>O mascote do FourBites</h2>
            <p>
              O Farelo tem o perfil oficial do site, com selo, e monta listas de sugestões que aparecem na página
              inicial. É ele também quem cuida da moderação: confere os cadastros de restaurantes e mantém o FourBites
              em ordem.
            </p>
            <Link to={`/perfil/${USERNAME_FARELO}`} className="fb-botao fb-botao-claro align-self-start">
              Ver perfil do Farelo
            </Link>
          </div>
        </section>

        {/* TCC */}
        <section className="fb-secao fb-sobre-tcc">
          <div className="fb-sobre-tcc-texto">
            <span className="fb-mao">feito com fome</span>
            <h2>Um projeto de TCC</h2>
            <p>
              O FourBites foi criado como Trabalho de Conclusão de Curso do curso de Sistemas para Internet da Fatec
              Rubens Lara, em 2026. A ideia nasceu da vontade de ter um lugar com avaliações de verdade, que ajudasse a
              escolher onde comer.
            </p>
            <div className="d-flex flex-wrap gap-2">
              {['React', 'Spring Boot', 'PostgreSQL'].map((t) => <span key={t} className="fb-sobre-chip">{t}</span>)}
            </div>
          </div>
          <div className="fb-sobre-equipe">
            <strong className="fb-sobre-equipe-titulo">Quem fez</strong>
            {INTEGRANTES.map((username) => <Integrante key={username} username={username} />)}
            <div className="fb-sobre-orientacao"><strong>Orientação:</strong> {ORIENTADOR}</div>
          </div>
        </section>
      </main>
      <Rodape />
    </>
  )
}

function Integrante({ username }) {
  const [perfil, setPerfil] = useState(null)

  useEffect(() => {
    api.buscarPerfil(username).then(setPerfil).catch(() => setPerfil(null))
  }, [username])

  return (
    <Link to={`/perfil/${username}`} className="fb-sobre-pessoa">
      <Avatar nome={perfil?.nome || username} foto={perfil?.fotoPerfil} />
      <span className="text-truncate">
        <strong className="d-block text-truncate">{perfil?.nome || `@${username}`}</strong>
        <span className="fb-cartao-meta">@{username}</span>
      </span>
      <i className="bi bi-chevron-right ms-auto" aria-hidden="true"></i>
    </Link>
  )
}
