const DAppWallJSON = artifacts.require('./build/contracts/DAppWallApp')
// const DAppWallContractRaw = artifacts.require("./DAppWallApp.sol");
const DAppWallABI = DAppWallJSON.abi

const globalArtifacts = this.artifacts // Not injected unless called directly via truffle
const globalWeb3 = this.web3 // Not injected unless called directly via truffle

const defaultOwner = process.env.OWNER
const defaultDaoFactoryAddress = process.env.DAO_FACTORY
const defaultENSAddress = process.env.ENS

const DAppWallContract = new web3.eth.Contract(DAppWallABI, '0xB01988E0039230B52256BB4Db4496a6C79092B4f');

module.exports = async (
  truffleExecCallback,
  {
    artifacts = globalArtifacts,
    web3 = globalWeb3,
    ensAddress = defaultENSAddress,
    owner = defaultOwner,
    daoFactoryAddress = defaultDaoFactoryAddress,
    verbose = true,
  } = {}
) => {
  const log = (...args) => {
    if (verbose) {
      console.log(...args)
    }
  }

  log(DAppWallABI)

  log('Deploying APM...')

  //log(DAppWallContract)

  const asyncFunc = await DAppWallContract.getPastEvents('listIP', {
    fromBlock: 0, 	//meter el bloque donde se despliega el contrato
    toBlock: 'latest'
  }, (error, events) => {
    log('evenement', events)
    // let contractEvents = events[0].returnValues;
    // log(contractEvents)
    //let swarmHash = contractEvents['_swarmHashList'];
  })

  asyncFunc()


  if (typeof truffleExecCallback === 'function') {
    // Called directly via `truffle exec`
    truffleExecCallback()
  } else {
    return {
    }
  }
}