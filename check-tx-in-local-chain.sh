curl -X POST --data '{"jsonrpc":"2.0","method":"eth_getTransactionReceipt","params":["0x2fbca9a4f782d53cc4ed28006536073b0f093f701d7db5e8bd13896d65e808f4"],"id":1}' http://localhost:8545 | grep topics

# source: https://github.com/ethereum/wiki/wiki/JSON-RPC#eth_gettransactionreceipt