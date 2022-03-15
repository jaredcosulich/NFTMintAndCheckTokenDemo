import {
  TWCircleSpinner,
  Web3ModalConnectButton,
  WrongEthereumNetworkMessage,
  MintNFTWithPriceAPI,
  PlaceholderGatedComponent
} from '.'

import { useEffect, useRef, useState } from 'react';
import StateMachine from 'javascript-state-machine';
import NodNFT from 'nod-nft-mint-and-check-token'

import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";

const flowStateMachine = new StateMachine({
  init: 'NOT_CONNECTED',
  transitions: [
    { name: 'connect',     from: 'NOT_CONNECTED', to: 'CONNECTED' },
    { name: 'badNetwork',  from: 'CONNECTED',     to: 'BAD_NETWORK'   },
    { name: 'goodNetwork', from: 'CONNECTED',     to: 'GOOD_NETWORK'  },
    { name: 'contract',    from: 'GOOD_NETWORK',  to: 'CONTRACT' },
    { name: 'noToken',     from: 'CONTRACT',      to: 'MINT'},
    { name: 'hasToken',    from: 'CONTRACT',      to: 'GATED_CONTENT'},
    { name: 'hasToken',    from: 'MINT',          to: 'GATED_CONTENT'}
  ]
});

const WalletHasTokenFlowAPI = ({ contractMetadata }) => {
  const [spinnerMessage, setSpinnerMessage] = useState("")
  const flowStates = useRef(flowStateMachine)
  const [flowState, setFlowState] = useState(flowStates.current.state)
  const info = useRef({
    web3Modal: null,
    provider: null,
    network: null
  })

  const transitionState = (action) => {
    try {
      flowStates.current[action]()
      setFlowState(flowStates.current.state)
    } catch (e) {
      console.log("Bad Transition", e)
    }
  }

  useEffect(() => {
    const handleFlowState = async () => {
      switch (flowStates.current.state) {
        case 'NOT_CONNECTED':
          const providerOptions = {
            walletconnect: {
              package: WalletConnectProvider, 
              options: {
                infuraId: "INFURA_ID"
              }
            }
          };
        
          info.current.web3Modal = new Web3Modal({
            providerOptions,
            network: contractMetadata.network,
            cacheProvider: false,
            disableInjectedProvider: false
          })       
          // info.current.web3Modal = instantiateWeb3Modal();
          break;
        case 'CONNECTED':
          setSpinnerMessage('Checking the network...')
          const network = await info.current.provider.getNetwork();
          info.current.network = network.chainId
          if (info.current.network !== contractMetadata.network) {
            transitionState('badNetwork')
          } else {
            transitionState('goodNetwork')
          }
          break;
        case 'GOOD_NETWORK':
          info.current.contract = NodNFT.lib.instantiateContract(
            contractMetadata, 
            info.current.provider
          )
          transitionState('contract')
          break;
        case 'CONTRACT':
          setSpinnerMessage('Checking wallet for NFT...')
          const { provider, contract } = info.current;
          const hasToken = await NodNFT.lib.providerSignerHasToken(
            provider,
            contract
          );
          transitionState(hasToken ? 'hasToken' : 'noToken')
          break;
      }
      setSpinnerMessage(null)
    }

    handleFlowState();
  }, [flowState])

  if (spinnerMessage !== null) {
    if (spinnerMessage.length > 0) {
      return (
        <TWCircleSpinner
          message={spinnerMessage}
        />
      );
    }
    return <TWCircleSpinner />
  }

  switch (flowState) {
    case 'NOT_CONNECTED':
      return (
        <Web3ModalConnectButton
          web3Modal={info.current.web3Modal}
          onConnect={(_provider) => {
            info.current.provider = _provider
            transitionState('connect');
          }}
        />
      )
    case 'BAD_NETWORK':
      return <WrongEthereumNetworkMessage 
        badNetworkId={info.current.network}
        goodNetworkId={contractMetadata.network}
      />
    case 'MINT':
      return (
        <MintNFTWithPriceAPI
          contract={info.current.contract}
          provider={info.current.provider}
          onMint={() => transitionState('hasToken')}
        />
      )
    case 'GATED_CONTENT':
      return <PlaceholderGatedComponent />   
  }

  return (
    <TWCircleSpinner />
  )
}

WalletHasTokenFlowAPI.defaultProps = {
  contractMetadata: NodNFT.contracts.SimpleURIAndPriceNFTWithWithdrawalRoyalty
}

export default WalletHasTokenFlowAPI;