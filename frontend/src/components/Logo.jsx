import logo from '../assets/logo.svg'

// Logo do FourBites (garfo amarelo no círculo vermelho), usado ao lado do nome.
// alt vazio: o nome "FourBites" já aparece escrito ao lado.
export default function Logo() {
  return <img src={logo} alt="" className="fb-logo" />
}
