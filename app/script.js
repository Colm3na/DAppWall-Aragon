import '@babel/polyfill'
import Aragon from '@aragon/api'

const app = new Aragon()

const initialState = {
  swarmHashList: '',
}
app.store(async (state, event) => {
  if (state === null) state = initialState;

  switch (event.event) {
    case INITIALIZATION_TRIGGER:
      return { swarmHashList: await getValue() }
    case 'listIP':
      return { swarmHashList: await getValue() }
    default:
      return state
  }
})

async function getValue() {
  // Get current value from the contract by calling the public getter
  // app.call() returns a single-emission observable that we can immediately turn into a promise
  const value = await app.call('value').toPromise();
  console.log('Value is', value);
  console.log('Value with parseInt', parseInt(value, 10));
  return parseInt(value, 10)
}
