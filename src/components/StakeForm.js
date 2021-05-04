import { useState, useEffect, useCallback } from 'react'
import { BigNumber, utils } from 'ethers'
import numeral from 'numeral'
import { useData } from '../dataContext'
import { useTransaction } from '../dataContext/transactions'
import { useWeb3 } from '../web3'
import { Button } from './shared/Button'
import lpIcon from '../assets/images/usdc.svg'
import lock from '../assets/images/lock.svg'

const StakeForm = () => {
  const { account } = useWeb3()
  const {
    liquidityFarming,
    lpTokenContract,
    myLPBalance,
    myLPAllowance,
    decimalsLP,
    canStake,
  } = useData()

  const [lp, setLP] = useState(0)

  const [lpBig, setLPBig] = useState(BigNumber.from(0))

  const [buttonText, setButtonText] = useState("Stake")
  const { contractCall, pending } = useTransaction()
  const [callData, setCallData] = useState([])

  const [buttonEnabled, setButtonEnabled] = useState(false)

  useEffect(() => {
    setButtonEnabled(!pending && lpBig.gt(0))
  }, [pending, lpBig])

  useEffect(() => {
    setLP(0)
  }, [account])

  useEffect(() => {
    setLPBig(utils.parseUnits((lp || 0).toFixed(decimalsLP), decimalsLP))
  }, [lp, decimalsLP])

  useEffect(() => {
    if (myLPAllowance.lt(lpBig)) {
      setButtonText("Approve LP")
      if (!lpTokenContract) return
      setCallData([
        lpTokenContract.approve,
        [liquidityFarming?.address, BigNumber.from(2).pow(BigNumber.from(256)).sub(BigNumber.from(1))],
        "Approving LP...", "LP approval failed!", "LP approval made!"
      ])
    } else {
      setButtonText("Lock my LP")
      if (!liquidityFarming) return
      setCallData([
        liquidityFarming.stake,
        [lpBig, { }],
        "Locking coins...", "Lock failed!", "Lock made!",
        () => {
          setLP(0)
        }
      ])
    }
  }, [ lp, lpBig, myLPAllowance, liquidityFarming, lpTokenContract ])

  const calls = e => {
    e.preventDefault()
    contractCall(...callData)
  }

  const Input = useCallback(({ currency, value, setValue, balance, decimals}) => {
    const calculateValue = setValue => {
      return e => {
        let normalizedValue = ""
        const inputValue = e.target.value
        if (inputValue) normalizedValue = Math.min(inputValue, numeral(balance).value())
        setValue(normalizedValue)
      }
    }

    const makeStep = decimals => {
      return `0.${Array(decimals).fill(0).join('')}`.slice(0, -1) + '1'
    }

    const inputDisable = !(canStake && numeral(balance).value() > 0)

    return (
      <div className="flex mb-4 text-sm">
        <div className="mr-4 flex flex-col items-center w-10">
          <div className="uppercase mb-2">{currency}</div>
        </div>
        <div className="w-full">
          <div className="flex justify-between mb-2 text-gray-400">
            <div className="mr-2">Amount*</div>
            <div>Balance: {balance}</div>
          </div>
          <input type="number" step={makeStep(decimals)} disabled={inputDisable} required name={currency} id={currency} value={value} onChange={calculateValue(setValue)} min="0" max={balance} className={`w-full border-2 border-gray-500 ${inputDisable ? 'text-gray-400' : 'text-white'} bg-gray-900`} placeholder={balance} />
        </div>
      </div>
    )
  }, [canStake])

  return (
    <div>
      <form onSubmit={calls}>
        <div className="mt-2 flex flex-col w-full items-center">
          <Input currency="lp" value={lp} setValue={setLP} balance={myLPBalance} decimals={decimalsLP} icon={lpIcon} />
        </div>
        <div className="mx-6">
          <div className="mb-4 text-center text-gray-400 text-2xs">
            Please see the documentation below for more info.
          </div>
          <Button type="submit" disabled={!buttonEnabled} icon={lock}>
            {buttonText}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default StakeForm
