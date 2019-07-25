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
  let swarmHashList;


  formButton.onclick = () => {
    // dirección smart contract confirmada 0x8252E41CBB3124B21C1BeB3AF14a5a6431DbF934
    // o es de la app???
    // dirección cambiante
    app.pastEvents('0x6A826EDeF7645119bf0f3FEA05a480f9bb89fb9A').toPromise()
    console.log('web3ETH', app.pastEvents('0x6A826EDeF7645119bf0f3FEA05a480f9bb89fb9A').toPromise())
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