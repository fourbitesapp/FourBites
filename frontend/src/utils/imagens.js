// Fotos enviadas pelo site ficam no Cloudinary no tamanho original 
export function foto(url, largura) {
  if (!url || !url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url
  return url.replace('/upload/', `/upload/f_auto,q_auto,c_limit,w_${largura}/`)
}
