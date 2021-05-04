import { useState, useEffect } from 'react'
import { Contract } from 'ethers'
import { useWeb3 } from '../web3'
import { useAddresses } from '../web3/chains'
import LiquidityFarming from '../../build-contracts/LiquidityFarming.json'
import ERC20 from '../../build-contracts/ERC20.json'

const useLiquidityFarmingContract = () => {
  const { chainId, signerOrProvider } = useWeb3()
  const addresses = useAddresses(chainId)
  const [liquidityFarmingContract, setLiquidityFarmingContract] = useState()

  useEffect(() => {
    if (!chainId || !addresses || !signerOrProvider) return

    setLiquidityFarmingContract(new Contract(addresses.liquidityFarming, LiquidityFarming.abi, signerOrProvider))
  }, [chainId, signerOrProvider, addresses])

  return liquidityFarmingContract
}

const useLPTokenContract = (liquidityFarming) => {
  const { signerOrProvider } = useWeb3()
  const [ lpToken, setLPToken ] = useState()

  useEffect(() => {
    if (!liquidityFarming || !signerOrProvider) return

    liquidityFarming.lp().then(lp => {
      setLPToken(new Contract(lp, ERC20.abi, signerOrProvider))
    }).catch(console.error)
  }, [liquidityFarming, signerOrProvider])

  return lpToken
}

const useSarcoContract = (liquidityFarming) => {
  const { signerOrProvider } = useWeb3()
  const [ sarcoContract, setSarcoContract ] = useState()

  useEffect(() => {
    if (!liquidityFarming || !signerOrProvider) return

    liquidityFarming.sarco().then(sarco => {
      setSarcoContract(new Contract(sarco, ERC20.abi, signerOrProvider))
    }).catch(console.error)
  }, [liquidityFarming, signerOrProvider])

  return sarcoContract
}

const useDecimals = (contract) => {
  const [ decimals, setDecimals ] = useState(0)

  useEffect(() => {
    if (!contract) return

    contract.decimals().then(decimals => {
      setDecimals(decimals)
    }).catch(console.error)
  }, [contract])

  return decimals
}

export {
  useLiquidityFarmingContract,
  useLPTokenContract,
  useSarcoContract,
  useDecimals
}