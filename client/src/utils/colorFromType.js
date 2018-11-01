export default color => {
  switch(color) {
    case 'good': return '#0f0'
    case 'bad': return '#f00'
    case 'status': return '#ff0'
    default: return '#fff'
  }
}