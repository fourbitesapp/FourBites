import { CircleMarker, MapContainer, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

// Mapinha com a localização de um restaurante
export default function MapaRestaurante({ latitude, longitude, nome }) {
  if (latitude == null || longitude == null) {
    return null
  }

  const posicao = [Number(latitude), Number(longitude)]

  const telaDeToque = window.matchMedia('(pointer: coarse)').matches

  return (
    <div className="fb-mapa" role="img" aria-label={`Mapa com a localização de ${nome}`}>
      <MapContainer
        center={posicao}
        zoom={16}
        scrollWheelZoom={false}
        dragging={!telaDeToque}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {}
        <CircleMarker
          center={posicao}
          radius={10}
          pathOptions={{ color: '#ffffff', weight: 3, fillColor: '#d9232c', fillOpacity: 1 }}
        />
      </MapContainer>
    </div>
  )
}

