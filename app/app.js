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
  let contractEvents;
  let swarmHash;
  let IPList;
  let swarmHashList;
  let headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  }


  formButton.onclick = () => {

    fetch(`https://swarm-gateways.net/bzz:/f3420ec94e0e74516ef8f00a6bb29da1871ed24a6dadf69043c05e7f4bcd4c55`, {
      headers: headers,
      method: 'GET',
    })
    .then( res => res.text())
    .then( data => {
      console.log('IP list in Swarm', data);
      IPList = JSON.parse(data);
    })

    // app.state().subscribe( data => {
    //   console.log('state is', data);
    // })
  
    let pastEvents = () => {
      return app.pastEvents(0, 1000000000000).toPromise().then( events => { return events })
    }
    let getPastEvents = pastEvents()
    getPastEvents.then( result => { console.log('pastEvents', result) })

    app.update(ip.value)
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