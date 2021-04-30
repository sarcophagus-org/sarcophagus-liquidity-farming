import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { toast } from 'react-toastify'
import Web3Modal from 'web3modal'
import WalletConnectProvider from '@walletconnect/web3-provider'
import { supportedChains } from './chains'
import detectEthereumProvider from '@metamask/detect-provider'

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: "27e484dcd9e3efcfd25a83a78777cdf1",
    },
  },
}

const web3Modal = new Web3Modal({ providerOptions })

const useUserSuppliedConnect = () => {
  const [provider, setProvider] = useState(null)
  const [userSupplied, setUserSupplied] = useState(null)
  
  // Allows auto connection to injected provider

  useEffect(() => {
    detectEthereumProvider().then(injectedProvider => {
      if(injectedProvider && window.ethereum?.selectedAddress) {
        setProvider(injectedProvider)
        setUserSupplied(new ethers.providers.Web3Provider(injectedProvider))
      }
    })
  }, [])

  web3Modal.on('connect', provider => {
    setProvider(provider)
    setUserSupplied(new ethers.providers.Web3Provider(provider))
  })

  useEffect(() => {
    if (provider) {
      provider.on('accountsChanged', accounts => {
        if (accounts.length === 0) {
          setProvider(null)
          setUserSupplied(null)
        }  
      })
      provider.on('chainChanged', chainId => {
        if (!supportedChains().includes(parseInt(chainId))) {
          toast.info('Switch to a supported network', {
            toastId: 'switchNetwork'
          })
          setProvider(null)
          setUserSupplied(null)
        }  
      })
    }
  }, [provider])

  return userSupplied
}

const connect = () => {
  web3Modal.connect().catch(console.error)
}

export { useUserSuppliedConnect, connect }