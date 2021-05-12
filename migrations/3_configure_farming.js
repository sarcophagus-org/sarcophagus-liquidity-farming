/* global artifacts, web3 */

const toBN = web3.utils.toBN
const LiquidityFarming = artifacts.require('LiquidityFarming')
const SarcoMock = artifacts.require('SarcoMock')

module.exports = async function (_, network) {
  let totalRewards, startTime, endTime

  const liquidityFarming = await LiquidityFarming.deployed()
  const tenEighteen = toBN(10).pow(toBN(18))

  if (['mainnet', 'mainnet-fork'].includes(network)) {
    totalRewards = toBN(2_500_000).mul(tenEighteen)
    startTime = 1620864000 // Thursday, May 13, 2021 12:00:00 AM GMT
    endTime = 1652400000 // Friday, May 13, 2022 12:00:00 AM GMT
  } else {
    const fullRewards = toBN(500_000).mul(tenEighteen)

    const sarcoMock = await SarcoMock.deployed()
    await sarcoMock.transfer(liquidityFarming.address, fullRewards)

    totalRewards = fullRewards
    startTime = Math.floor(Date.now() / 1000) + 60 // now plus 1 minute
    endTime = startTime + 60 * 60 // start time plus 1 hour
  }

  await liquidityFarming.deposit(totalRewards, startTime, endTime)
}
