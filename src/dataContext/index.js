import { createContext, useContext, useState, useEffect } from 'react'
import { utils } from 'ethers'
import numeral from 'numeral'
import {
  useLiquidityFarmingContract,
  useLPTokenContract,
  useSarcoContract,
  useDecimals
} from './contracts'
import {
  useTotalRewards,
  useTotalClaimedRewards,
  useRewardsPerTime,
} from './totalRewards'
import {
  useCurrentBlock,
  useCurrentTime,
  useStartTime,
  useFirstStakeTime,
  useEndTime,
  useElapsedTime,
  useRemainingTime,
  useTimeUntilKickoff,
} from './blocks'
import {
  useMyPendingRewards,
  useMyClaimedRewards,
  useMyRewardsPerTime,
} from './myRewards'
import {
  useCanStake,
  useCanPayout,
  useCanWithdraw,
} from './abilities'
import { useTotalStakeLP } from './totalStakes'
import { useMyStakeLP } from './myStakes'
import { useMyLPAllowance, useMyLPBalance } from './myBalances'

let context

const createDataRoot = () => {
  context = createContext()

  context.displayName = 'Data Provider'
  const Provider = context.Provider

  const makeDecimals = decimals => {
    return `0,0.[${Array(decimals).fill(0).join("")}]`
  }

  const makeNumeral = (bigNumber, decimals) => {
    return numeral(utils.formatUnits(bigNumber, decimals))
  }

  const moneyString = (bigNumber, decimals) => {
    const money = makeNumeral(bigNumber, decimals).format(makeDecimals(decimals))
    if (money === "NaN") return "0"
    return money
  }

  const counterString = seconds => {
    seconds = Number(seconds)
    var d = Math.floor(seconds / (3600 * 24))
    var h = Math.floor(seconds % (3600 * 24) / 3600)
    var m = Math.floor(seconds % 3600 / 60)
    var s = Math.floor(seconds % 60)

    var dDisplay = d > 0 ? d + (d === 1 ? " day, " : " days, ") : ""
    var hDisplay = h > 0 ? h + (h === 1 ? " hour, " : " hours, ") : ""
    var mDisplay = m > 0 ? m + (m === 1 ? " minute, " : " minutes, ") : ""
    var sDisplay = s > 0 ? s + (s === 1 ? " second" : " seconds") : ""

    if (!dDisplay && !hDisplay && !mDisplay && !sDisplay) sDisplay = "0 seconds"

    return (dDisplay + hDisplay + mDisplay + sDisplay).replace(/,\s*$/, "")
  }

  const dateString = seconds => {
    return new Date(seconds * 1000).toLocaleString()
  }

  const StateEnum = Object.freeze({
    NotScheduled: 1,
    Scheduled: 2,
    Ready: 3,
    Active: 4,
    Over: 5,
  })

  const useSystemState = (startTime, timeUntilKickoff, firstStakeTime, remainingTime) => {
    const [state, setState] = useState(StateEnum.NotScheduled)

    useEffect(() => {
      if (startTime.eq(0)) {
        setState(StateEnum.NotScheduled)
      } else if (timeUntilKickoff.gt(0)) {
        setState(StateEnum.Scheduled)
      } else if (firstStakeTime.eq(0)) {
        setState(StateEnum.Ready)
      } else if (remainingTime.gt(0)) {
        setState(StateEnum.Active)
      } else {
        setState(StateEnum.Over)
      }
    }, [startTime, timeUntilKickoff, firstStakeTime, remainingTime])

    return state
  }

  return ({ children }) => {
    const liquidityFarming = useLiquidityFarmingContract()

    const sarcoContract = useSarcoContract(liquidityFarming)
    const lpTokenContract = useLPTokenContract(liquidityFarming)

    const decimalsSarco = useDecimals(sarcoContract)
    const decimalsLP = useDecimals(lpTokenContract)

    const totalRewards = useTotalRewards(liquidityFarming)
    const totalClaimedRewards = useTotalClaimedRewards(liquidityFarming)

    const totalStakeLP= useTotalStakeLP(liquidityFarming)

    const currentBlock = useCurrentBlock()
    const currentTime = useCurrentTime(currentBlock)
    const startTime = useStartTime(liquidityFarming)
    const firstStakeTime = useFirstStakeTime(liquidityFarming)
    const endTime = useEndTime(liquidityFarming)
    const rewardsPerTime = useRewardsPerTime(totalRewards, startTime, firstStakeTime, endTime)

    const timeUntilKickoff = useTimeUntilKickoff(currentTime, startTime)

    const elapsedTime = useElapsedTime(currentTime, firstStakeTime, endTime)
    const remainingTime = useRemainingTime(firstStakeTime, elapsedTime, endTime)
    const totalEmittedRewards = elapsedTime.mul(rewardsPerTime)
    const totalUnemittedRewards = remainingTime.mul(rewardsPerTime)
    const totalUnclaimedRewards = totalEmittedRewards.sub(totalClaimedRewards)

    const myStakeLP = useMyStakeLP(liquidityFarming)

    const isActive = startTime.gt(0) && timeUntilKickoff.eq(0) && firstStakeTime.gt(0) && remainingTime.gt(0) && myStakeLP.gt(0)
    const myRewardsPerTime = useMyRewardsPerTime(liquidityFarming, currentBlock, rewardsPerTime, isActive)
    const myPendingRewards = useMyPendingRewards(liquidityFarming, currentBlock, currentTime, myRewardsPerTime, isActive)
    const myClaimedRewards = useMyClaimedRewards(liquidityFarming)

    const myTotalRewards = myPendingRewards.add(myClaimedRewards)

    const myLPBalance = useMyLPBalance(lpTokenContract, currentBlock)

    const myLPAllowance = useMyLPAllowance(liquidityFarming, lpTokenContract, currentBlock)

    const systemState = useSystemState(startTime, timeUntilKickoff, firstStakeTime, remainingTime)

    const canStake = useCanStake(systemState, StateEnum)
    const canPayout = useCanPayout(myPendingRewards)
    const canWithdraw = useCanWithdraw(myStakeLP)

    const dataContext = {
      liquidityFarming, lpTokenContract, sarcoContract,
      decimalsLP,
      totalRewards: moneyString(totalRewards, decimalsSarco),
      totalClaimedRewards: moneyString(totalClaimedRewards, decimalsSarco),
      rewardsPerTime: moneyString(rewardsPerTime, decimalsSarco),
      totalEmittedRewards: moneyString(totalEmittedRewards, decimalsSarco),
      totalUnemittedRewards: moneyString(totalUnemittedRewards, decimalsSarco),
      totalUnclaimedRewards: moneyString(totalUnclaimedRewards, decimalsSarco),
      totalStakeLP: moneyString(totalStakeLP, decimalsLP),
      currentTime: dateString(currentTime),
      startTime: dateString(startTime),
      firstStakeTime: dateString(firstStakeTime),
      endTime: dateString(endTime),
      timeUntilKickoff: counterString(timeUntilKickoff),
      remainingTime: counterString(remainingTime),
      myStakeLP: moneyString(myStakeLP, decimalsLP),
      myPendingRewards: moneyString(myPendingRewards, decimalsSarco),
      myClaimedRewards: moneyString(myClaimedRewards, decimalsSarco),
      myTotalRewards: moneyString(myTotalRewards, decimalsSarco),
      myRewardsPerTime: moneyString(myRewardsPerTime, decimalsSarco),
      myLPBalance: moneyString(myLPBalance, decimalsLP),
      myLPAllowance,
      canStake,
      canPayout,
      canWithdraw,
      systemState, StateEnum
    }

    return <Provider value={dataContext}>{children}</Provider>
  }
}

const DataProvider = createDataRoot()

const useData = () => {
  return useContext(context)
}

export { DataProvider, useData }