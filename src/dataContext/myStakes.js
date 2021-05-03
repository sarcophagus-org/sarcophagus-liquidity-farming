import { useState, useEffect } from 'react'
import { BigNumber } from 'ethers'
import { useWeb3 } from '../web3'

const useMyStakeLP = (liquidityFarming) => {
  const [myStakeLP, setMyStakeLP] = useState(BigNumber.from(0))
  const { account } = useWeb3()

  useEffect(() => {
    if (!liquidityFarming || !account) return

    liquidityFarming.userStakeLP(account).then(lp => {
      setMyStakeLP(lp)
    }).catch(console.error)

    const addLP = (_, lp) => {
      setMyStakeLP(_lp => _lp.add(lp))
    }

    const removeLP = (_, lp) => {
      setMyStakeLP(_lp => _lp.sub(lp))
    }

    const myStakeFilter = liquidityFarming.filters.Stake(account, null, null, null)
    liquidityFarming.on(myStakeFilter, addLP)

    const myWithdrawFilter = liquidityFarming.filters.Withdraw(account, null, null, null, null)
    liquidityFarming.on(myWithdrawFilter, removeLP)

    return () => {
      liquidityFarming.removeListener(myStakeFilter, addLP)
      liquidityFarming.removeListener(myWithdrawFilter, removeLP)
    }
  }, [liquidityFarming, account])

  return myStakeLP
}

export {
  useMyStakeLP
}
