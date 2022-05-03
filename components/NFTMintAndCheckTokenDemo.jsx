import React, { useCallback, useEffect, useRef, useState } from 'react'
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
  const [showWallet, setShowWallet] = useState();

  const checkNfts = useCallback(async () => {
    const { network, address, abi } = ContractInfo;
    
    const transferInformation = await lib.tokenTransfers(
      network, 
      user.wallet.address, 
      address, 
      abi
    )

    if (transferInformation.currentTokenIds.length === 0) {
      return;
    }
    
    const tokenUri = await lib.query({
      network, 
      address, 
      abi, 
      functionName: 'tokenURI', 
      inputValues: [transferInformation.currentTokenIds[0]]
    })

    const response = await fetch(tokenUri)
    const metadata = await response.text()

    setNft({ metadata })

    // const nfts = await lib.walletContents(user.wallet.address)
    // for (const nft of nfts) { 
    //   if (nft.token_address.toLowerCase() === ContractInfo.address.toLowerCase()) {
    //     setNft(nft);
    //     break;
    //   }
    // }
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

  const confirmTransaction = () => {
    return new Promise((resolve, reject) => {
      setShowWallet(
        <div className='text-center'>
          <h1 className='text-lg pb-3'>Confirm Transaction</h1>
          <div>
            Are you sure you want mint a token? 
            <br/>
            It will cost you 0.001 ETH.
          </div>
          <div className='pt-3 flex justify-around'>
            <TWButton
              onClick = {() => {
                resolve(true);
                setShowWallet(null)
              }}
            >
              Confirm
            </TWButton>
            <TWButton
              classMap={{
                background: 'bg-red-600'
              }}
              onClick={() => {
                resolve(false);
                setShowWallet(null)
              }}
            >
              Cancel
            </TWButton>
          </div>
        </div>
      );
    })
  }

  const mint = async () => {
    if (!user) return;

    const confirmation = await confirmTransaction();
    if (!confirmation) return;

    try {
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
        onComplete: async () => {
          setMessage("Minting Completed, Confirming Transaction...");
          await checkNfts();
          setMessage("")
        }
      })
    } catch (error) {
      console.log(error);
    }
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
      {showWallet && (
        <div className='absolute -top-0 right-60'>
          <div className='p-6 border-b border-l border-r bg-green-100'>
            {showWallet}
          </div>
        </div>  
      )} 
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