import {
  TWCircleSpinner,
  MintPriceAndButton,
  MintingEtherscanLinkMessage
} from '.'

import { useState } from 'react';
import NodNFT from 'nod-nft-mint-and-check-token'

const MintNFTWithPriceAPI = ({ provider, contract, onMint  }) => {
  const [minting, setMinting] = useState()
  const [statusMessage, setStatusMessage] = useState()

  const mint = async (mintPriceInWei) => {
    setMinting(true)

    setStatusMessage(null)
    await NodNFT.lib.mintWithLifecycleHooks({ 
      contract,
      provider,
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
      onFailure: (code) => {
        setStatusMessage(NodNFT.lib.humanReadableMetamaskError(code));
        setMinting(false)
      }
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