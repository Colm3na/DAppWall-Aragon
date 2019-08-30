const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');
const shell = require('shelljs');
const fetch = require('node-fetch');
const Web3 = require('web3');
let swarmHashList;
let IPList = [];
let headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
}

let web3 = new Web3(new Web3.providers.WebsocketProvider('wss://rinkeby.infura.io/ws'));

// const DAppWallABI = [ { "constant": false, "inputs": [ { "name": "_swarmHashList", "type": "bytes32" } ], "name": "update", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "_from", "type": "address" }, { "indexed": true, "name": "_swarmHashList", "type": "bytes32" } ], "name": "listIP", "type": "event" } ];
// const DAppWallContract = new web3.eth.Contract(DAppWallABI, '0xc95ede37405df941d090e5b8708753980eafab8d');

let subscription = new web3.eth.subscribe('logs', {
    address: '0xc95ede37405df941d090e5b8708753980eafab8d', // DAppWall app address in DAO
    topics: ['0xfc309f76ab5d2df586b10094f9f43f5c14badba301def398889b383680fdfb9a'] // signature of DAppWall
}, function(error, result){
    if (!error) {
        console.log(result.topics[2]);
        swarmHashList = result.topics[2];
        swarmHashList = swarmHashList.slice(2, swarmHashList.length); // Swarm doesn't allow '0x' as a prefix


        // GET IP List from Swarm
        fetch(`https://swarm-gateways.net/bzz:/${swarmHashList}`, {
            headers: headers,
            method: 'GET',
        })
        .then( res => res.text())
        .then( data => {
            console.log('IP list in Swarm', data);
            IPList = JSON.parse(data);

             // create iptables for DAppWall. Right now all ips are treated as malicious and banned.
            let iptablesContent = `#!/bin/sh\n### first flush all the iptables Rules\niptables -F\n\n`;
            for ( let i = 0; i < IPList.length; i++ ) {
                iptablesContent = iptablesContent + `iptables -A INPUT -s ${IPList[i].ip} -j ${IPList[i].label}\n`
            }

            fs.writeFile('dappwall_iptables.sh', iptablesContent, (data) => {});
            fs.chmodSync('./dappwall_iptables.sh', '755');
            // shell.exec('./dappwall_iptables.sh');
        })
    } else {
        console.log('Error! ', error);
    }
})
.on('data', function(log){
    console.log(log);
})
.on('changed', function(log){
    console.log('log was changed to ', log);
});

// unsubscribes the subscription
subscription.unsubscribe(function(error, success){
    if(success)
        console.log('Successfully unsubscribed!');
});

app.listen(3000, () => {
    console.log('Server is listening on port 3000');
})