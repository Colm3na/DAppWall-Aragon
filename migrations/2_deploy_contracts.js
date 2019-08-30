/* global artifacts */
var DAppWallApp = artifacts.require('DAppWallApp.sol')

module.exports = function(deployer) {
  deployer.deploy(DAppWallApp)
}
