import { useEffect, useState } from 'react';

const MintingEtherscanLinkMessage = ({ provider, transaction }) => {
  const [href, setHref] = useState();

  useEffect(() => {
    const buildHref = async () => {
      const hrefParts = ['https://']
      const network = await provider.getNetwork();
      if (network.name !== 'homestead') {
        hrefParts.push(`${network.name}.`)
      }
      hrefParts.push('etherscan.io/tx/')
      hrefParts.push(transaction.hash)

      setHref(hrefParts.join(''))
    }

    buildHref();
  }, [provider, transaction])

  return (
    <div>
      <p>Minting in progress...</p>
      {href &&
        <p>
          You can view your pending transaction on
          &nbsp; 
          <a 
            href={href} 
            target='_blank' 
            rel="noopener"
            className='text-blue-800 underline'
          >
            Etherscan
          </a>
        </p>
      }
    </div>
  )
}

export default MintingEtherscanLinkMessage;