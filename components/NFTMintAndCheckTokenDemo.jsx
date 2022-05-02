import React, { useState } from 'react'
import {
  TWFullScreen,
  TWCenteredContent,
  WalletHasTokenFlowAPI
} from '.'
import { tailwind } from 'ethos-react2';

import { ContractInfo } from '../contracts';
import { TWButton } from '.';

const NFTMintAndCheckTokenDemo = () => {  
  const [user, setUser] = useState();

  return (
    <TWFullScreen>
      <TWCenteredContent>
        <div className='text-center'>
          <h2 className='text-xl pb-6'>
            NFT Gated Content Demo
          </h2>
          {user ? (
            <div className='py-6'>
              <h3 className='text-lg'>
                Hi {user.email}!
              </h3>
              <div className='py-3'>
                Address: {user.wallet.address}
              </div>
              <div className='py-3'>
                <div className='py-3'>
                  To join our community you need to mint a token!
                </div>  

                <TWButton>
                  Mint!
                </TWButton>
              </div>
            </div> 
          ) : (
            <tailwind.SignInButton 
              className='bg-gray-200 px-3 py-1 rounded-lg' 
              onSignIn={setUser}
            />
          )}
          
          {/* <WalletHasTokenFlowAPI contractMetadata={ContractInfo}/> */}
        </div>
      </TWCenteredContent>
    </TWFullScreen>
  )
}

export default NFTMintAndCheckTokenDemo;