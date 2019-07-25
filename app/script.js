import '@babel/polyfill'
import Aragon from '@aragon/api'

const app = new Aragon()

const initialState = {
  swarmHashList: '',
}
app.store(async (state, event) => {
  if (state === null) state = initialState;

  switch (event.event) {
    case 'listIP':
      return { swarmHashList: await getValue() }
    default:
      return state
  }
})

async function getValue() {
  // Get current value from the contract by calling the public getter
  // app.call() returns a single-emission observable that we can immediately turn into a promise
  return new Promise(resolve => {
    app
      .call('value')
      .first()
      .map(value => parseInt(value, 10))
      .subscribe(resolve)
  })
}
