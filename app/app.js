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
  // let id = document.getElementById('id');
  const ip = document.getElementById('ip');
  const formButton = document.getElementById('listIP');
  const label = document.getElementById('label');
  let ipRegExp = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\/)(\d{2})$/;
  let swarmHash;
  let ipInput;
  let IPList = [];
  let formData;
  let swarmHashList;
  let headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }


  formButton.onclick = () => {

    ipInput = ip.value;
    formData = {
      ip: ip.value,
      label: label.value
    }

    console.log(`ipInput is`, ipInput);

    // if (ipInput.match(ipRegExp)) {
      let pastEvents = () => {
        return app.pastEvents(0, 1000000000000).toPromise().then( events => { return events });
      }
      let getPastEvents = pastEvents()

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
          app.update(swarmHashList).toPromise();

        })
      }

      let getFromSwarm = (swarmHashList) => {
        fetch(`https://swarm-gateways.net/bzz:/${swarmHashList}`, {
          headers: headers,
          method: 'GET',
        })
        .then( res => res.text())
        .then( data => {
          console.log('IP list in Swarm', data);
          IPList = JSON.parse(data);

          IPList.push(formData);
          console.log('This is the current ip list', IPList);

          postToSwarm(IPList);
        })
      }

      getPastEvents.then( result => { 
        console.log('pastEvents', result);

        // case this is the first event to occur
        if ( result.length === 0) {
          IPList.push(formData);
          postToSwarm(IPList);

        } else {

          swarmHashList = result[result.length-1].raw.topics[2];
          swarmHashList = swarmHashList.slice(2, swarmHashList.length); // swarm doesn't accept '0x' in URL. we take it away
          console.log('swarmHashList is', swarmHashList);
  
          getFromSwarm(swarmHashList);

        }

      })


    // }

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