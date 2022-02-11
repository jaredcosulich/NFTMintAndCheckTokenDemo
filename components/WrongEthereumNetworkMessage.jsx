const WrongEthereumNetworkMessage = ({ badNetwork, goodNetwork }) => {
  return (
    <div className='text-center'>
      <div className='pb-6'>
        You are on the wrong network.
      </div>
      <div className='pb-6'>
        You are on {badNetwork}.
        You need to be on {goodNetwork}.
      </div>
      <div className='pb-6'>
        Please refresh the page when you are on {goodNetwork}.
      </div>
    </div>
  )
}

WrongEthereumNetworkMessage.defaultProps = {
  badNetwork: 'BAD_NETWORK',
  goodNetwork: 'GOOD_NETWORK'
}

export default WrongEthereumNetworkMessage;