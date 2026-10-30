// Selo do perfil oficial do FourBites 
export default function SeloOficial({ compacto = false }) {
  if (compacto) {
    return (
      <i className="bi bi-patch-check-fill fb-selo-oficial-icone" role="img"
        aria-label="Perfil oficial do FourBites" title="Perfil oficial do FourBites"></i>
    )
  }
  return (
    <span className="fb-selo-oficial" title="Perfil oficial do FourBites">
      <i className="bi bi-patch-check-fill" aria-hidden="true"></i> Oficial FourBites
    </span>
  )
}