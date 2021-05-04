import { useState, useEffect } from 'react'
import { useWeb3 } from '../web3'

const useCanStake = (systemState, StateEnum) => {
  const { account } = useWeb3()
  const [canStake, setCanStake] = useState(false)

  useEffect(() => {
    setCanStake(account && [StateEnum.Ready, StateEnum.Active].includes(systemState))
  }, [account, systemState, StateEnum])

  return canStake
}

const useCanPayout = (pendingRewards) => {
  const { account } = useWeb3()
  const [canPayout, setCanPayout] = useState(false)

  useEffect(() => {
    setCanPayout(account && pendingRewards.gt(0))
  }, [account, pendingRewards])

  return canPayout
}

const useCanWithdraw = (lp) => {
  const { account } = useWeb3()
  const [canWithdraw, setCanWithdraw] = useState(false)

  useEffect(() => {
    setCanWithdraw(account && lp.gt(0))
  }, [ account, lp ])

  return canWithdraw
}

export {
  useCanStake,
  useCanPayout,
  useCanWithdraw,
}
