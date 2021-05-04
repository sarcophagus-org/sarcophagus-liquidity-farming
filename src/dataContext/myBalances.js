import { useState, useEffect } from 'react'
import { BigNumber } from 'ethers'
import { useWeb3 } from '../web3'

const useMyLPBalance = (lpContract, currentBlock) => {
  const { account } = useWeb3()
  const [balance, setBalance] = useState(BigNumber.from(0))

  useEffect(() => {
    if (!account || !lpContract) return

    lpContract.balanceOf(account).then(balance => {
      setBalance(balance)
    }).catch(console.error)
  }, [account, lpContract, currentBlock])

  return balance
}

const useMyLPAllowance = (liquidityFarming, lpContract, currentBlock) => {
  const { account } = useWeb3()
  const [allowance, setAllowance] = useState(BigNumber.from(0))

  useEffect(() => {
    if (!account || !liquidityFarming || !lpContract) return

    lpContract.allowance(account, liquidityFarming.address).then(allowance => {
      setAllowance(allowance)
    }).catch(console.error)
  }, [account, liquidityFarming, lpContract, currentBlock])

  return allowance
}

export {
  useMyLPBalance,
  useMyLPAllowance,
}
