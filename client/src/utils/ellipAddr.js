export default function(addr) {
  if (addr) {
    const start = addr.substr(0, 6)
    const end = addr.substr(-4)
    return start + '...' + end
  }
  return ''
}
