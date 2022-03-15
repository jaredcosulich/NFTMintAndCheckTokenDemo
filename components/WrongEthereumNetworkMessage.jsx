import NodNFT from "nod-nft-mint-and-check-token";

const WrongEthereumNetworkMessage = ({ badNetworkId, goodNetworkId }) => {
  return (
    <div className='text-center'>
      <div className='pb-6'>
        You are on the wrong network.
      </div>
      <div className='pb-6'>
        You are on {NodNFT.lib.ethereumNetworkIdToName(badNetworkId)}.
        You need to be on {NodNFT.lib.ethereumNetworkIdToName(goodNetworkId)}.
      </div>
      <div className='pb-6'>
        Please refresh the page when you are on {NodNFT.lib.ethereumNetworkIdToName(goodNetworkId)}.
      </div>
    </div>
  )
}

WrongEthereumNetworkMessage.defaultProps = {
  badNetworkId: '2',
  goodNetworkId: '3'
}

export default WrongEthereumNetworkMessage;