export default function(string) {
  // This is a temp solution, doesn't work that well
  const vmError = "Error: VM Exception while processing transaction: revert "
  const i = string.lastIndexOf(vmError)
  return string.substring(i + vmError.length)
}