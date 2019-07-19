import Aragon, { providers } from '@aragon/api';
import { Web3 } from 'web3';

const initializeApp = () => {
  const web3 = new Web3("https://rinkeby.infura.io/v1");
  const app = new Aragon(new providers.WindowMessage(window.parent));

  const view = document.getElementById('view');

  app.state().subscribe(
    state => {
      // the state is null in the beginning, when there are no event emitted from the contract
      view.innerHTML = `The swarmHashList is ${state ? state.swarmHashList : 0}`
    },
    err => {
      view.innerHTML = 'An error occured, check the console'
      console.log(err)
    }
  )

  const container = document.querySelectorAll('div')[0];
  const form = document.getElementById('ip-form');
  // let id = document.getElementById('id');
  const ip = document.getElementById('ip');
  const formButton = document.getElementById('formButton');
  const label = document.getElementById('label');
  let ipRegExp = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\/)(\d{2})$/;
  let contractEvents;
  let swarmHash;
  let swarmHashList;
  let IPList = [];
  let formData;
  let accounts;
  let headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
  }

  const DappWallABI = [
    {
      "constant": false,
      "inputs": [
        {
          "name": "_swarmHashList",
          "type": "bytes32"
        }
      ],
      "name": "update",
      "outputs": [],
      "payable": true,
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "name": "_from",
          "type": "address"
        },
        {
          "indexed": true,
          "name": "_swarmHashList",
          "type": "bytes32"
        }
      ],
      "name": "listIP",
      "type": "event"
    }
  ];

  // get smart contract
  const DappWallContract = new web3.eth.Contract(DappWallABI, '0x6a826edef7645119bf0f3fea05a480f9bb89fb9a');

  // formButton.onclick = () => {
  //     console.log('hello')
  // }
  // the real thing
  form.addEventListener('submit', async (e) => {
    console.log('You just submitted a form');
    // delete warning message
    let warnings = document.querySelectorAll('.warning');
    // retrieve red from input
    ip.style.borderColor = '';
    if ( warnings.length > 0 ) {
        warnings.forEach( w => w.remove() );
    }

    let ipForm = ip.value;
    // validate input is a ipv4 address
    if ( ipForm.match(ipRegExp) ) {
        console.log('contract', DappWallContract);
        console.log('contract', DappWallContract.events.allEvents());
        // First of all, call smart contract and get the current IP list from Swarm
        DappWallContract.getPastEvents('listIP', {
            fromBlock: 4445524, 	//meter el bloque donde se despliega el contrato
            toBlock: 'latest'
        }, (error, events) => {

            contractEvents = events[events.length - 1].returnValues;
            swarmHash = contractEvents['_swarmHashList'];
            swarmHashList = swarmHash.slice(2, swarmHash.length);
            console.log('current swarmHashList is', swarmHashList);

            // GET IP List from Swarm
            fetch(`https://swarm-gateways.net/bzz:/${swarmHashList}`, {
                headers: headers,
                method: 'GET',
            })
            .then( res => res.text())
            .then( data => {
                console.log('IP list in Swarm', data);
                IPList = JSON.parse(data);

                formData = {
                    // id: id.value,
                    ip: ip.value,
                    label: label.value
                }
                
                IPList.push(formData);
                console.log('This is the current ip list', IPList);
                
                // POST IP list to Swarm
                fetch('https://swarm-gateways.net/bzz:/', {
                    headers: headers,
                    method: 'POST',
                    body: JSON.stringify(IPList)
                })
                .then( res => res.text())
                .then( data => {
                    console.log('new swarmHashList', data);
    
                    swarmHashList = data;
    
                    // POST SwarmHashList to smart DappWallContract
                    DappWallContract.methods.update('0x' + swarmHashList).send({from: accounts[0]}, (error, transactionHash) => {
                        console.log('tx hash from smart contract', transactionHash);
                    });
    
                    // This is ONLY FOR CHECKING PURPOSES
                    // GET from Swarm with fetch
                    fetch(`https://swarm-gateways.net/bzz:/${swarmHashList}`, {
                        headers: headers,
                        method: 'GET',
                    })
                    .then( res => res.text())
                    .then( data => {
                        console.log('IP list in Swarm AFTER POST', data);
                        // send current iplist after post to node, to update iptables
                        fetch('http://localhost:3001', {
                            headers: headers,
                            method: 'POST',
                            body: data
                        })
                    })
                    .catch( err => console.log(err));
    
                })
            })
            .catch( err => console.log(err));
      })
    }
  })
}

const sendMessageToWrapper = (name, value) => {
  window.parent.postMessage({ from: 'app', name, value }, '*')
}

// handshake between Aragon Core and the iframe,
// since iframes can lose messages that were sent before they were ready
window.addEventListener('message', ({ data }) => {
  if (data.from !== 'wrapper') {
    return
  }
  if (data.name === 'ready') {
    sendMessageToWrapper('ready', true)
    initializeApp()
  }
})