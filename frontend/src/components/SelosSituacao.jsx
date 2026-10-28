import { selosDaSituacao } from '../utils/restaurantes.js'

// Selos "Publicado", "Em análise", "Precisa de ajustes"... ao lado do nome do restaurante.
export default function SelosSituacao({ restaurante, visao }) {
  return selosDaSituacao(restaurante, visao).map((selo) => (
    <span key={selo.texto} className={`fb-selo fb-selo-${selo.cor}`}>
      <span className="fb-ponto" aria-hidden="true"></span>{selo.texto}
    </span>
  ))
}
