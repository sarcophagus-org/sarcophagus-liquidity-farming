/* global artifacts */

const LiquidityFarming = artifacts.require('LiquidityFarming')
const LPMock = artifacts.require('LPMock')
const SarcoMock = artifacts.require('SarcoMock')

module.exports = async function (deployer, network) {
  let lpAddress, sarcoAddress

  if (['mainnet', 'mainnet-fork'].includes(network)) {
    lpAddress = ''
    sarcoAddress = '0x7697b462a7c4ff5f8b55bdbc2f4076c2af9cf51a'
  } 
  else if (['goerli', 'goerli-fork'].includes(network)) {
    sarcoAddress = '0x4633b43990b41B57b3678c6F3Ac35bA75C3D8436',
    lpAddress = '0x1af9eD986c61D40983c055ACa20e4Df7980399cF'
  }
  else {
    await deployer.deploy(LPMock)
    await deployer.deploy(SarcoMock)

    lpAddress = (await LPMock.deployed()).address
    sarcoAddress = (await SarcoMock.deployed()).address
  }

  await deployer.deploy(LiquidityFarming, lpAddress, sarcoAddress)
}
