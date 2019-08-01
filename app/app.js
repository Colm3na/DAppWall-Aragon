import Aragon, { providers } from '@aragon/api';
import { resolve } from 'dns';
import { reject } from 'q';

const initializeApp = () => {
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
  const ip = document.getElementById('ip');
  const formButton = document.getElementById('listIP');
  const label = document.getElementById('label');
  let IPClientList = document.getElementById('IPList');
  let ipRegExp = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\/)(\d{2})$/;
  let ipInput;
  var contractEvents;
  let IPList = [];
  let swarmHashList;
  let headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
  let formData = {
    ip: ip.value,
    label: label.value
  }

  let deleteWarningMessages = () => {
    let warnings = document.querySelectorAll('.warning');
    // retrieve red from input
    ip.style.borderColor = '';
    if ( warnings.length > 0 ) {
        warnings.forEach( w => w.remove() );
    }
  }

  let postToSwarm = (IPList) => {
    // POST IP list to Swarm
    fetch('https://swarm-gateways.net/bzz:/', {
      headers: headers,
      method: 'POST',
      body: JSON.stringify(IPList)
    })
    .then( res => res.text())
    .then( data => {
      console.log('new swarmHashList', data);

      swarmHashList = '0x' + data; // transform again swarmHashList in bytes 32

      // POST SwarmHashList to smart DappWallContract
      app.update(swarmHashList).toPromise().then( () => {
        createIPListElement(IPList);
      });

    })
  }

  let getFromSwarm = (swarmHashList) => {
    return new Promise((resolve, reject) => {
      fetch(`https://swarm-gateways.net/bzz:/${swarmHashList}`, {
        headers: headers,
        method: 'GET',
      })
      .then( res => res.text())
      .then( data => {
        console.log('IP list in Swarm', data);
        IPList = JSON.parse(data);
  
        // check if there is a new ip & label pair to add
        if ( formData.ip !== '' && formData !== '' ) {
          IPList.push(formData);
        }
        console.log('This is the current ip list', IPList);
  
        resolve(IPList);
      })
    })
  }

  let createIPListElement = (IPList) => {
    let domLiString = '';

    IPList.forEach( IP => {
      domLiString = domLiString + `<li>${IP.ip}  ${IP.label}</li>`;
    })

    IPClientList.innerHTML = domLiString;
  }

  let pastEvents = () => {
    return app.pastEvents(0, 1000000000000).toPromise().then( events => { return events });
  }
  let getPastEvents = pastEvents();
  

  // first of all, paint the ip list for the client
  getPastEvents.then( events => {
    contractEvents = events;
    // check contract's past events
    console.log('These are the past events of contract', events)
    swarmHashList = contractEvents[contractEvents.length-1].raw.topics[2];
    swarmHashList = swarmHashList.slice(2, swarmHashList.length); // swarm doesn't accept '0x' in URL. we take it away
    console.log('This is the swarmHashList', swarmHashList)

    getFromSwarm(swarmHashList).then( iplist => {
      IPList = iplist;
      createIPListElement(IPList);
    });

  })

  // action starts
  formButton.onclick = () => {

    // delete all warning messages
    deleteWarningMessages()

    ipInput = ip.value;
    formData = {
      ip: ip.value,
      label: label.value
    }

    console.log(`ipInput is`, ipInput);

    // check if input is a valid ip and if label has been selected
    // also check if a label has been chosen
    if (ipInput.match(ipRegExp) && label.value !== '') {

      // case this is the first event to occur
      if ( contractEvents.length === 0) {
        IPList.push(formData);
        postToSwarm(IPList);

      } else {

        getFromSwarm(swarmHashList).then( iplist => {
          IPList = iplist;
          postToSwarm(IPList);
        })

      }
    // in case input is not a valip ip or label is empty: warning messages
    } else {
      
      ip.style['border-color'] = 'red';
      let warningMessage = document.createElement('span');
      warningMessage.className = 'warning';
      warningMessage.style.color = 'red';

      if (label.value === '') {
        warningMessage.innerHTML = 'Please, choose either DROP or ACCEPT';
      } else {
        warningMessage.innerHTML = 'Please, enter a correct IP range';
      }
      document.body.appendChild(warningMessage);

    }

  }

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