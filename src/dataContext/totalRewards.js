import { useState, useEffect } from 'react'
import { BigNumber } from 'ethers'

const useTotalRewards = (liquidityFarming) => {
  const [totalSarcoRewards, setTotalSarcoRewards] = useState(BigNumber.from(0))

  useEffect(() => {
    if (!liquidityFarming) return

    liquidityFarming.totalRewards().then(sarco => {
      setTotalSarcoRewards(sarco)
    }).catch(console.error)

    const updateTotalRewards = (totalRewards) => {
      setTotalSarcoRewards(totalRewards)
    }

    liquidityFarming.on('Deposit', updateTotalRewards)

    return () => {
      liquidityFarming.removeListener('Deposit', updateTotalRewards)
    }

  }, [liquidityFarming])

  return totalSarcoRewards
}

const useTotalClaimedRewards = (liquidityFarming) => {
  const [totalClaimedSarcoRewards, setTotalClaimedSarcoRewards] = useState(BigNumber.from(0))

  useEffect(() => {
    if (!liquidityFarming) return

    liquidityFarming.totalClaimedRewards().then(sarco => {
        setTotalClaimedSarcoRewards(sarco)
      }).catch(console.error)

    const getClaimedRewards = (_, _sarco) => {
      setTotalClaimedSarcoRewards(sarco => sarco.add(_sarco))
    }

    liquidityFarming.on('Payout', getClaimedRewards)

    return () => {
      liquidityFarming.removeListener('Payout', getClaimedRewards)
    }
  }, [liquidityFarming])

  return totalClaimedSarcoRewards
}

const useRewardsPerTime = (totalRewards, startTime, firstStakeTime, endTime) => {
  const [rewardsPerTime, setRewardsPerTime] = useState(BigNumber.from(0))

  useEffect(() => {
    if (startTime.eq(0)) {
      setRewardsPerTime(BigNumber.from(0))
      return
    }

    if (firstStakeTime.eq(0)) {
      setRewardsPerTime(totalRewards.div(endTime.sub(startTime)))
      return
    }

    setRewardsPerTime(totalRewards.div(endTime.sub(firstStakeTime)))
  }, [totalRewards, startTime, firstStakeTime, endTime])

  return rewardsPerTime
}

export {
  useTotalRewards,
  useTotalClaimedRewards,
  useRewardsPerTime,
}
