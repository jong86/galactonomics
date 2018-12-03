export default function(string) {
  // This is a temp solution, doesn't work that well
  if (typeof string === 'object') {
    string = JSON.stringify(string)
  }

  let i, errorMsg
  errorMsg = "Error: VM Exception while processing transaction: revert "
  i = string.lastIndexOf(errorMsg)

  if (i === -1) {
    errorMsg = "Error: MetaMask Tx Signature: "
    i = string.lastIndexOf(errorMsg)
  }

  const output = string.substring(i + errorMsg.length)
  return output
}