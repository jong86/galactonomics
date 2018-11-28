export default color => {
  switch(color) {
    case 'good': return '#0f0'
    case 'bad': return '#f00'
    case 'status': return '#ff0'
    case 'info': return '#0ff'
    case 'dark': return '#666'
    default: return '#fff'
  }
}