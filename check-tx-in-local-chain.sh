# How I am making tests in local devchain of Aragon:
#
# I finally found that doing curl to the localhost:8545 was a great solution.
# Just update "params" with the tx hash you can find on Metamask while running on the localhost 8545 network.

curl -X POST --data '{"jsonrpc":"2.0","method":"eth_getTransactionReceipt","params":["0x8de5c6ca81ae8dbb12470e7ab782bcf999868c890d60864ba8d428d268e6f999"],"id":1}' http://localhost:8545 |  jq -r ".result.logs[].topics[]"

# source: https://github.com/ethereum/wiki/wiki/JSON-RPC#eth_gettransactionreceipt
