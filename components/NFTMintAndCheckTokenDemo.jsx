import React, { useCallback, useEffect, useState } from 'react'
import {
  TWFullScreen,
  TWCenteredContent,
  WalletHasTokenFlowAPI
} from '.'

import { tailwind, lib } from 'ethos-react2';

import { ContractInfo } from '../contracts';
import { TWButton } from '.';

const NFTMintAndCheckTokenDemo = () => {  
  const [user, setUser] = useState();
  const [message, setMessage] = useState();
  const [nft, setNft] = useState();
  const [gated, setGated] = useState(false)

  const checkNfts = useCallback(async () => {
    const nfts = await lib.walletContents(user.wallet.address)
    for (const nft of nfts) { 
      if (nft.token_address.toLowerCase() === ContractInfo.address.toLowerCase()) {
        setNft(nft);
        break;
      }
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      const activeUser = lib.activeUser();
      if (activeUser) {
        console.log("Active User: ", activeUser)
        setUser(activeUser);
      }
      return;
    }

    const fetchUser = async () => {
      setUser(user);
      checkNfts();
    };

    fetchUser();
  }, [user])

  const mint = () => {
    if (!user) return;

    lib.transact({
      email: user.email,
      network: ContractInfo.network,
      address: ContractInfo.address,
      abi: ContractInfo.abi,
      functionName: 'mint',
      inputValues: [{ value: 100000000000000 }], 
      onReady: () => setMessage("Signing Minting Request..."),
      onSigned: () => setMessage("Sending Minting Request..."),
      onSent: () => setMessage("Waiting For Confirmation..."),
      onComplete: () => setMessage("Minting Completed, Confirming Transaction..."),
      onConfirmed: () => {
        setMessage(null)
        checkNfts();
      }
    })
  }

  const logout = () => {
    lib.logout();
    setNft(null);
    setUser(null);
    setGated(false)
  }

  const enter = () => {
    setGated(true);
  }

  return (
    <TWFullScreen>
      <div className='container mx-auto'>
        { user && (
          <div className='border-b px-3 py-6 flex justify-between'>
            <div>NFT Gated Content Demo</div>
            <div>
              <TWButton
                onClick={logout}
              >
                Logout
              </TWButton>
            </div>
          </div>
        )}
        <TWCenteredContent>
          <div className='text-center'>
            {user ? (
              <div className='py-24'>
                {gated ? (
                  <div className='text-center text-2xl'>
                    GATED CONTENT
                  </div> 
                ) : (
                  <>
                    <h3 className='text-lg'>
                      Hi {user.email}!
                    </h3>
                    <div className='py-3'>
                      Address: {user.wallet.address}
                    </div>
                    <div className='py-3'>
                      {nft ? (
                        <>
                          <div className='text-center flex items-center justify-center'>
                            <img
                              src={JSON.parse(nft.metadata || "{}").image || "https://testnets.opensea.io/static/images/placeholder.png"}
                              alt={nft.name}
                              className='object-contain w-60 h-40'
                            />
                          </div>
                          <div className='py-3'>
                            You've minted a token. Welcome to the community!
                          </div>
                          <TWButton onClick={enter}>
                            Enter Community
                          </TWButton>
                        </>
                      ) : (
                        <>
                          <div className='py-3'>
                            To join our community you need to mint a token!
                          </div>  

                          <TWButton
                            onClick={mint}
                          >
                            Mint!
                          </TWButton>
                        </>
                      )}
                      

                      {message && (
                        <div className='pt-3'>
                          {message}
                        </div>
                      )}
                    </div>
                  </>
                )}                
              </div> 
            ) : (
              <div className='py-36'>
                <h2 className='text-xl pb-6'>
                  NFT Gated Content Demo
                </h2>
                <tailwind.SignInButton 
                  className='bg-gray-200 px-3 py-1 rounded-lg' 
                  onSignIn={setUser}
                />
              </div>
            )}
            
            {/* <WalletHasTokenFlowAPI contractMetadata={ContractInfo}/> */}
          </div>
        </TWCenteredContent>
      </div>
    </TWFullScreen>
  )
}

export default NFTMintAndCheckTokenDemo;