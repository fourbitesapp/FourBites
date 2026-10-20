import { useEffect } from 'react'
import L from 'leaflet'
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

import { formatarNota } from '../utils/formatos.js'

// Centro de Santos, usado quando a lista está vazia.
const CENTRO_PADRAO = [-23.9608, -46.3336]

// Pino em forma de etiqueta com a nota (vermelho quando está em destaque).
function pino(restaurante, destaque) {
  return L.divIcon({
    className: `fb-pino ${destaque ? 'destaque' : ''}`,
    html: `<span>★ ${formatarNota(restaurante.notaMedia)}</span>`,
    iconSize: [0, 0],
  })
}

// Ajusta o zoom para caber todos os restaurantes da lista.
function Enquadrar({ restaurantes }) {
  const mapa = useMap()
  useEffect(() => {
    const pontos = restaurantes.map((r) => [Number(r.latitude), Number(r.longitude)])
    if (pontos.length === 1) mapa.setView(pontos[0], 15)
    else if (pontos.length > 1) mapa.fitBounds(pontos, { padding: [40, 40] })
  }, [restaurantes, mapa])
  return null
}

// Mapa do Explorar: um pino por restaurante; clicar no pino destaca o cartão da lista.
export default function MapaExplorar({ restaurantes, destaqueId, aoEscolher }) {
  return (
    <div className="fb-mapa-grande" role="region" aria-label="Mapa com os restaurantes encontrados">
      <MapContainer center={CENTRO_PADRAO} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Enquadrar restaurantes={restaurantes} />
        {restaurantes.map((r) => (
          <Marker key={r.id} position={[Number(r.latitude), Number(r.longitude)]}
            icon={pino(r, r.id === destaqueId)} zIndexOffset={r.id === destaqueId ? 1000 : 0}
            title={r.nome} eventHandlers={{ click: () => aoEscolher(r.id) }} />
        ))}
      </MapContainer>
    </div>
  )
}
