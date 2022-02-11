import {
  TWCircleSpinner,
  TWButton
} from '.'

import { ethers } from 'ethers';
import { useEffect, useState } from 'react';

const MintPriceAndButton = ({ contract, mint }) => {
  const [mintPriceInWei, setMintPriceInWei] = useState();

  useEffect(() => {
    const getPrice = async () => {
      const mintPriceInWei = await contract.mintPrice()
      setMintPriceInWei(mintPriceInWei)
    }

    getPrice();
  }, [contract])

  let mintPrice;
  if (mintPriceInWei) {
    mintPrice = ethers.utils.formatEther(mintPriceInWei);
  }

  if (!mintPrice) {
    return (
      <TWCircleSpinner />
    );
  }

  return (
    <div>
      <p className='mb-3'>
        Mint this NFT 
        for {mintPrice} ETH
      </p>
      <TWButton
        onClick={() => mint(mintPriceInWei)}
      >
        Mint
      </TWButton>
    </div>
  )

}

export default MintPriceAndButton;