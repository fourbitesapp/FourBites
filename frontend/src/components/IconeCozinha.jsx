import { iconeDaCozinha } from '../utils/cozinhas.js'

export default function IconeCozinha({ nome, tamanho = 40 }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none" stroke="#241612" strokeWidth="1.7"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={iconeDaCozinha(nome)} />
    </svg>
  )
}
