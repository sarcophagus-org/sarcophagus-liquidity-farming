import { useState, useEffect } from 'react'
import { BigNumber } from 'ethers'

const useTotalStakeLP = (liquidityFarming) => {
  const [totalStakeLP, setTotalStakeLP] = useState(BigNumber.from(0))

  useEffect(() => {
    if (!liquidityFarming) return

    liquidityFarming.totalStakeLp().then(lp => {
      setTotalStakeLP(lp)
    }).catch(console.error)

    const addLP = (_, lp) => {
      setTotalStakeLP(_lp => _lp.add(lp))
    }

    const removeLP = (_, lp) => {
      setTotalStakeLP(_lp => _lp.sub(lp))
    }

    liquidityFarming.on('Stake', addLP)
    liquidityFarming.on('Withdraw', removeLP)

    return () => {
      liquidityFarming.removeListener('Stake', addLP)
      liquidityFarming.removeListener('Withdraw', removeLP)
    }
  }, [liquidityFarming])

  return totalStakeLP
}


export {
  useTotalStakeLP
}
