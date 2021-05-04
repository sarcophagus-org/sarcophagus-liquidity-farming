import { useState, useEffect } from 'react'
import { BigNumber } from 'ethers'
import { useWeb3 } from '../web3'

const useMyPendingRewards = (liquidityFarming, currentBlock, currentTime, rewardIncrement, isActive) => {
  const [pendingRewards, setPendingRewards] = useState(BigNumber.from(0))
  const { account } = useWeb3()

  useEffect(() => {
    if (isActive) {
      setPendingRewards(pendingRewards => pendingRewards.add(rewardIncrement))
    }
  }, [currentTime, rewardIncrement, isActive])

  useEffect(() => {
    if (!liquidityFarming || !account) return

    liquidityFarming.totalUserStake(account).then(stake => {
      if (stake.gt(0)) {
        liquidityFarming.callStatic.payout(account).then(reward => {
          setPendingRewards(reward)
        }).catch(console.error)
      } else {
        setPendingRewards(BigNumber.from(0))
      }
    }).catch(console.error)
    
  }, [liquidityFarming, currentBlock, account])

  return pendingRewards
}

const useMyClaimedRewards = (liquidityFarming) => {
  const [claimedRewards, setClaimedRewards] = useState(BigNumber.from(0))
  const { account } = useWeb3()

  useEffect(() => {
    if (!liquidityFarming || !account) return

    liquidityFarming.userClaimedRewards(account).then(reward => {
      setClaimedRewards(reward)
    }).catch(console.error)

    const addMyClaimedRewards = (_, reward) => {
      setClaimedRewards(rewards => rewards.add(reward))
    }

    const myClaimedRewardsFilter = liquidityFarming.filters.Payout(account, null, null)
    liquidityFarming.on(myClaimedRewardsFilter, addMyClaimedRewards)

    return () => {
      liquidityFarming.removeListener(myClaimedRewardsFilter, addMyClaimedRewards)
    }
  }, [liquidityFarming, account])

  return claimedRewards
}

const useMyRewardsPerTime = (liquidityFarming, currentBlock, rewardPerTime, isActive) => {
  const [rewardIncrement, setRewardIncrement] = useState(BigNumber.from(0))
  const { account } = useWeb3()

  useEffect(() => {
    if (!liquidityFarming || !account) return

    if (!isActive) {
      setRewardIncrement(BigNumber.from(0))
      return
    }

    Promise.all([liquidityFarming.totalStake(), liquidityFarming.totalUserStake(account)])
      .then(([total, user]) => {
        if (total.eq(0)) {
          setRewardIncrement(BigNumber.from(0))
        } else {
          setRewardIncrement(rewardPerTime.mul(user).div(total))
        }
      }).catch(console.error)
  }, [liquidityFarming, account, currentBlock, rewardPerTime, isActive])

  return rewardIncrement
}

export {
  useMyPendingRewards,
  useMyClaimedRewards,
  useMyRewardsPerTime,
}
