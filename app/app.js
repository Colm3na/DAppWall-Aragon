import Aragon, { providers } from '@aragon/api';

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
  let loading = document.getElementById('loading');
  let warning = document.getElementById('warning');
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

  let getSwarmHashList = (contractEvents) => {
    swarmHashList = contractEvents[contractEvents.length-1].raw.topics[2];
    swarmHashList = swarmHashList.slice(2, swarmHashList.length); // swarm doesn't accept '0x' in URL. we take it away
    return swarmHashList;
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

      loading.removeAttribute('hidden');

      // POST SwarmHashList to smart DappWallContract
      app.update(swarmHashList).toPromise().then( () => {
        createIPListElement(IPList);
        loading.setAttribute('hidden', true);
          // reload site
          window.location.reload(true);
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

        // in case that retrieving IP list from Swarm fails
        if (IPList.Msg) {
          let warningMessage = document.createElement('span');
          warningMessage.className = 'warning';
          warningMessage.style.color = 'red';
          warningMessage.style.textAlign = 'center';
          warningMessage.innerHTML = 'Swarm IP list couldn\'t be fetched';
          container.body.appendChild(warningMessage);
          warning.removeAttribute('hidden');
        }

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
      // in case this ip is actually a list of ips
      if (Array.isArray(IP.ip)) {
        let listLabel = IP.label;
        IP.ip.forEach( ip => {
          domLiString = domLiString + `<li>${ip}  ${listLabel}</li>`;
        })
      // case it is just one ip
      } else {
        domLiString = domLiString + `<li>${IP.ip}  ${IP.label}</li>`;
      }
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
    console.log('These are the past events of contract', contractEvents)
    swarmHashList = getSwarmHashList(contractEvents);
    console.log('This is the swarmHashList', swarmHashList)

    getFromSwarm(swarmHashList).then( iplist => {
      IPList = iplist;
      createIPListElement(IPList);
    });

  })

  let checkAndCreateWarnings = (labelValue, list) => {
    // warning symbol appears
    warning.removeAttribute('hidden');

    ip.style['border-color'] = 'red';
    let warningMessage = document.createElement('span');
    warningMessage.className = 'warning';
    warningMessage.style.color = 'red';

    if (labelValue === '') {
      warningMessage.innerHTML = 'Please, choose either DROP or ACCEPT';
    } else {
      if (list) {
        warningMessage.innerHTML = 'One of the IPs entered is not a valid IP range';
      } else {
        warningMessage.innerHTML = 'Please, enter a correct IP range';
      }
    }
    document.body.appendChild(warningMessage);

  }

  let updateIPList = (formData) => {
    // case this is the first event to occur
    if ( contractEvents.length === 0) {
      IPList.push(formData);
      postToSwarm(IPList);

    } else {

      swarmHashList = getSwarmHashList(contractEvents);

      getFromSwarm(swarmHashList).then( iplist => {
        IPList = iplist;
        postToSwarm(IPList);
      })

    }
  }

  // action starts
  formButton.onclick = () => {

    // delete all warning messages
    deleteWarningMessages()
    // hide warning symbol
    warning.setAttribute('hidden', true);

    ipInput = ip.value;

    console.log(`ipInput is`, ipInput);

    // check if input is a list and if it is, match the regex for each element
    // also check if a label has been selected for the list
    if(ip.value.includes(',') && label.value !== '') {
      let inputList = ip.value.split(',');
      console.log('LIST is', inputList); 
      let IPListArray = [];

      // check if input is a valid ip 
      inputList.forEach( input => {
        if (input.match(ipRegExp)) {
          IPListArray.push(input);
        } else {
          checkAndCreateWarnings(label.value, true);
        }
      })

      console.log('Ip list array is', IPListArray);
      formData = {
        ip: IPListArray,
        label: label.value
      }

      updateIPList(formData);

    // case this is only one ip
    } else {

      formData = {
        ip: ip.value,
        label: label.value
      }

      // check if input is a valid ip and if label has been selected
      if (ipInput.match(ipRegExp) && label.value !== '') {
        updateIPList(formData)
      // in case input is not a valip ip or label is empty: warning messages
      } else {
        checkAndCreateWarnings(label.value, false);
      }
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