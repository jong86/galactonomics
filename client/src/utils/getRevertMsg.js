export default function(string) {
  // This is a temp solution, doesn't work that well
  if (typeof string === 'object') {
    string = JSON.stringify(string)
  }
  const vmError = "Error: VM Exception while processing transaction: revert "
  const i = string.lastIndexOf(vmError)
  const output = string.substring(i + vmError.length)
  return output
}