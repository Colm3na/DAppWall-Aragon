curl -X POST --data '{"jsonrpc":"2.0","method":"eth_getTransactionReceipt","params":["0xf05d87d5b2b6d20e9b51c95c05e6c3eb26cf7969317e0e2460dce9b840263fe9"],"id":1}' http://localhost:8545 |  jq -r ".result.logs[].topics[]"
# old one: 0x2fbca9a4f782d53cc4ed28006536073b0f093f701d7db5e8bd13896d65e808f4

# source: https://github.com/ethereum/wiki/wiki/JSON-RPC#eth_gettransactionreceipt