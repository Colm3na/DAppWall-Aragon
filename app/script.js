import '@babel/polyfill'
import Aragon from '@aragon/api'

const app = new Aragon()

const initialState = {
  swarmHashList: '',
}
app.store(async (state, event) => {
  if (state === null) state = initialState

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
  const value = await app.call('swarmHashList').toPromise()
  return parseInt(value, 10)
}
