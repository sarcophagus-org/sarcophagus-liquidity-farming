import { useState, useEffect } from 'react'
import { BigNumber } from 'ethers'
import { useWeb3 } from '../web3'

const useCurrentBlock = () => {
  const [currentBlock, setCurrentBlock] = useState(0)
  const { provider } = useWeb3()

  useEffect(() => {
    if (!provider) return

    provider.getBlockNumber().then(blockNumber => {
      setCurrentBlock(blockNumber)
    }).catch(console.error)

    const getBlockNumber = blockNumber => {
      setCurrentBlock(blockNumber)
    }

    provider.on('block', getBlockNumber)

    return () => {
      provider.removeListener('block', getBlockNumber)
    }
  }, [provider])

  return currentBlock
}

const useCurrentTime = (blockNumber) => {
  const [currentTime, setCurrentTime] = useState(BigNumber.from(Math.floor(Date.now() / 1000)))
  const { provider } = useWeb3()

  useEffect(() => {
    if (!provider) return

    provider.getBlock(blockNumber).then(block => {
      if (blockNumber > 0) {
        setCurrentTime(BigNumber.from(block.timestamp))
      }
    }).catch(console.error)

    const timer = setInterval(() => {
      setCurrentTime(currentTime => currentTime.add(BigNumber.from(1)))
    }, 1000)

    return () => {
      clearInterval(timer)
    }
  }, [provider, blockNumber])

  return currentTime
}

const useStartTime = (liquidityFarming) => {
  const [startTime, setStartTime] = useState(BigNumber.from(0))

  useEffect(() => {
    if (!liquidityFarming) return

    liquidityFarming.startTime().then(startTime => {
      setStartTime(startTime)
    }).catch(console.error)

    const updateStartTime = (_, startTime) => {
      setStartTime(startTime)
    }

    liquidityFarming.on('Deposit', updateStartTime)

    return () => {
      liquidityFarming.removeListener('Deposit', updateStartTime)
    }

  }, [liquidityFarming])

  return startTime
}

const useFirstStakeTime = (liquidityFarming) => {
  const [firstStakeTime, setFirstStakeTime] = useState(BigNumber.from(0))

  useEffect(() => {
    if (!liquidityFarming) return

    const updateFirstStake = () => {
      liquidityFarming.firstStakeTime().then(firstStakeTime => {
        setFirstStakeTime(firstStakeTime)
      }).catch(console.error)
    }

    updateFirstStake()

    liquidityFarming.on('Stake', updateFirstStake)

    return () => {
      liquidityFarming.removeListener('Stake', updateFirstStake)
    }

  }, [liquidityFarming])

  return firstStakeTime
}

const useEndTime = (liquidityFarming) => {
  const [endTime, setEndTime] = useState(BigNumber.from(0))

  useEffect(() => {
    if (!liquidityFarming) return

    liquidityFarming.endTime().then(endTime => {
      setEndTime(endTime)
    }).catch(console.error)

    const updateEndTime = (_, __, _endTime) => {
      setEndTime(_endTime)
    }

    liquidityFarming.on('Deposit', updateEndTime)

    return () => {
      liquidityFarming.removeListener('Deposit', updateEndTime)
    }
  }, [liquidityFarming])

  return endTime
}

const useElapsedTime = (currentTime, firstStakeTime, endTime) => {
  const [elapsedTime, setElapsedTime] = useState(BigNumber.from(0))

  useEffect(() => {
    if (firstStakeTime.eq(0)) {
      setElapsedTime(BigNumber.from(0))
      return
    }

    if (endTime.lt(currentTime)) {
      setElapsedTime(endTime.sub(firstStakeTime))
      return
    }

    setElapsedTime(currentTime.sub(firstStakeTime))
  }, [currentTime, firstStakeTime, endTime])

  return elapsedTime
}

const useRemainingTime = (firstStakeTime, elapsedTime, endTime) => {
  const [remainingTime, setRemainingTime] = useState(BigNumber.from(0))

  useEffect(() => {
    if (firstStakeTime.eq(0)) {
      setRemainingTime(BigNumber.from(0))
      return
    }

    setRemainingTime(endTime.sub(firstStakeTime.add(elapsedTime)))
  }, [firstStakeTime, elapsedTime, endTime])

  return remainingTime
}

const useTimeUntilKickoff = (currentTime, startTime) => {
  const [timeUntilKickoff, setTimeUntilKickoff] = useState(BigNumber.from(0))

  useEffect(() => {
    if (currentTime.gt(startTime)) {
      setTimeUntilKickoff(BigNumber.from(0))
      return
    }

    setTimeUntilKickoff(startTime.sub(currentTime))
  }, [currentTime, startTime])

  return timeUntilKickoff
}

export {
  useCurrentBlock,
  useCurrentTime,
  useStartTime,
  useFirstStakeTime,
  useEndTime,
  useElapsedTime,
  useRemainingTime,
  useTimeUntilKickoff,
}
