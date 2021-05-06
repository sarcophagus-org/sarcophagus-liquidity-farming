import { useState, useEffect } from 'react'
import { useData } from '../dataContext'
import { Row } from './shared/Value'
import { Button } from './shared/Button'
import { useWeb3 } from '../web3'
import { useTransaction } from '../dataContext/transactions'
import unlock from '../assets/images/unlock.svg'

const Unlock = () => {
  const { account } = useWeb3()
  const {
    myStakeLP,
    liquidityFarming,
    canPayout,
    canWithdraw,
  } = useData()

  const { contractCall, pending } = useTransaction()

  const [withdrawEnabled, setWithdrawEnabled] = useState(false)

  useEffect(() => {
    setWithdrawEnabled(!pending && canWithdraw)
  }, [pending, canPayout, canWithdraw])

  const withdraw = () => {
    contractCall(
      liquidityFarming.withdraw, [account, { }],
      "Unlocking stablecoins...", "Unlock failed!", "Unlock successful!"
    )
  }

  return (
    <div>
      <div className="mx-4 mb-4">
        <Row value={myStakeLP}>UNI-V2 LP SARCO/ETH Locked</Row>
      </div>
      <Button disabled={!withdrawEnabled} onClick={withdraw} icon={unlock}>
        Unlock my LP Tokens
      </Button>
    </div>
  )
}

export default Unlock
