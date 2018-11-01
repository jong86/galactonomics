export default function(string) {
  const vmError = "Error: VM Exception while processing transaction: revert "
  const i = string.lastIndexOf(vmError)
  return string.substring(i + vmError.length)
}