import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  TWFullScreen,
  TWCenteredContent,
  WalletHasTokenFlowAPI
} from '.'

import { tailwind, lib } from 'ethos-react2';

import { ContractInfo } from '../contracts';
import { TWButton } from '.';

const host = 'http://localhost:3001';
const appId = 'app1';

const NFTMintAndCheckTokenDemo = () => {  
  const [user, setUser] = useState();
  const [message, setMessage] = useState();
  const [nft, setNft] = useState();
  const [gated, setGated] = useState(false)

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
  }, [user]);

  useEffect(() => {
    const getUser = async () => {
      const user = await lib.activeUser(appId);
      setUser(user);
    } 

    getUser();
  }, [])

  useEffect(() => {
    if (!user) return;
    checkNfts();
  }, [user, checkNfts])

  const mint = async () => {
    try {
      lib.transact({
        network: ContractInfo.network,
        address: ContractInfo.address,
        abi: ContractInfo.abi,
        functionName: 'mint',
        inputValues: [{ value: 1000000000000000 }], 
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
    lib.logout(appId, false);
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
                classMap={{
                  margin: 'mr-6',
                  background: 'bg-white-500',
                  fontColor: 'text-slate-800',
                  border: 'border-2 rounded-lg'
                }}
                onClick={() => lib.showWallet(appId)}
              >
                Wallet
              </TWButton>
              <TWButton
                classMap={{
                  background: 'bg-slate-800',
                  border: 'border-2 rounded-lg'
                }}
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
                          <div className='pb-12 text-sm text-slate-500'>
                            Minting costs 0.001 ETH 
                          </div>

                          <TWButton
                            classMap={{
                              padding: 'px-6 py-1',
                              border: 'border-2 rounded-lg'
                            }}
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
              <>
                {user === undefined ? (
                  <div className='text-center'>
                    ...
                  </div>
                ) : (
                  <div className='py-36'>
                    <h2 className='text-xl pb-6'>
                      NFT Gated Content Demo
                    </h2>
                    <tailwind.SignInButton 
                      appId={appId}
                      className='bg-slate-200 px-3 py-1 rounded-lg' 
                      onSignIn={setUser}
                    />
                  </div>
                )}
              </>              
            )}
            
            {/* <WalletHasTokenFlowAPI contractMetadata={ContractInfo}/> */}
          </div>
        </TWCenteredContent>
      </div>
      <div className='hidden text-slate-800'>
        <div>
          <div className="relative z-10 text-slate-500">
            <div
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-25" />
            </div>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center -translate-y-36">
                <div
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <div className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 align-middle shadow-xl transition-all text-center">
                    <div
                      as="h3"
                      className="text-xl font-medium leading-6 text-slate-800"
                    >
                      Sign In
                    </div>
                    <div className="mt-3">
                      <p className="text-sm text-slate-500">
                        Click to sign in with one of these methods:
                      </p>
                    </div>

                    <div className="mt-3 py-3">
                      <p className="text-sm text-slate-300 font-bold">
                        [VARIOUS METHODS INCLUDING WALLET CONNECT]
                      </p>
                    </div>

                    <div className="mt-3">
                      <p className="text-sm text-slate-500">
                        Or enter your email and we'll send you a magic link!
                      </p>
                    </div>

                    <div className='mt-3'>
                      <input
                        type="email"
                        className="border border-slate-300 px-3 py-1 w-10/12 rounded-md"
                        placeholder="Email"
                        required                        
                      />
                    </div>

                    <div className="mt-3">
                      <button
                        type="button"
                        className="focus:outline-none inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"                        
                      >
                        Send Magic Link
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TWFullScreen>
  )
}

export default NFTMintAndCheckTokenDemo;