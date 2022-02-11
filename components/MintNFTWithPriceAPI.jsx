import {
  TWCircleSpinner,
  MintPriceAndButton
} from '.'

import { useState } from 'react';
import NodNFT from 'nod-nft-mint-and-check-token'

const MintNFTWithPriceAPI = ({ provider, contract, onMint  }) => {
  const [minting, setMinting] = useState()
  const [statusMessage, setStatusMessage] = useState()

  const mint = async (mintPriceInWei) => {
    setMinting(true)

    // Make call to Arweave endpoint
    // const metadataUri = 'https://arweave.net/ree7K2412t0Io6Mv8A3e6DqL_jogEM9Oainu9VRn8yQ'
    // This contract already has the base URI
    const metadataUri = 'ree7K2412t0Io6Mv8A3e6DqL_jogEM9Oainu9VRn8yQ'

    setStatusMessage(null)
    await NodNFT.lib.mintWithLifecycleHooks({ 
      contract,
      provider,
      metadataUri,
      mintPriceInWei,
      onTransaction: (transaction) => {
        const message = (
          <MintingEtherscanLinkMessage
            provider={provider}
            transaction={transaction}
          />
        );
        setStatusMessage(message);
      },
      onMint,
      onFailure: () => setMinting(false)
    })
  }

  if (minting) {
    return <TWCircleSpinner 
      message={
        statusMessage ? statusMessage : "Minting in progress..."
      }
    />
  }

  return (
    <div className='text-center'>
      {statusMessage && 
        <p className='mb-3'>
          {statusMessage}
        </p>
      }
      <MintPriceAndButton
        contract={contract}
        mint={mint}
      />
    </div>
  )
}

MintNFTWithPriceAPI.defaultProps = {
  provider: {
    getSigner: () => {}
  },
  contract: {
    mintPrice: () => 1000000,
    connect: () => {}
  }
}

export default MintNFTWithPriceAPI;