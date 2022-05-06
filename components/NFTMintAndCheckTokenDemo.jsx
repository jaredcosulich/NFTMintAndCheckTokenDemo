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

const NFTMintAndCheckTokenDemo = () => {  
  const [user, setUser] = useState();
  const [message, setMessage] = useState();
  const [nft, setNft] = useState();
  const [balance, setBalance] = useState();
  const [gated, setGated] = useState(false)
  const [showWallet, setShowWallet] = useState();

  if (typeof window !== 'undefined') {
    window.onfocus = (e) => {
      checkBalance();
    }
  }

  const checkNfts = useCallback(async () => {
    const { network, address, abi } = ContractInfo;
    
    const transferInformation = await lib.tokenTransfers(
      network, 
      user.wallet.address, 
      address, 
      abi,
      host
    )

    if (transferInformation.currentTokenIds.length === 0) {
      return;
    }

    console.log("TOKEN ID", transferInformation.currentTokenIds[0])
    
    const tokenUri = await lib.query({
      network, 
      address, 
      abi, 
      functionName: 'tokenURI', 
      inputValues: [transferInformation.currentTokenIds[0]],
      host
    })

    const response = await fetch(tokenUri)
    const metadata = await response.text()

    setNft({ metadata })

    // const nfts = await lib.walletContents(user.wallet.address, host)
    // for (const nft of nfts) { 
    //   if (nft.token_address.toLowerCase() === ContractInfo.address.toLowerCase()) {
    //     setNft(nft);
    //     break;
    //   }
    // }
  }, [user]);

  const checkBalance = useCallback(async () => {
    if (!user) return;

    const balance = await lib.ethBalance({ 
      network: ContractInfo.network,
      address: user.wallet.address,
      host
    });
    
    setBalance(parseInt(balance * 100000) / 100000)
  }, [user]);

  useEffect(() => {
    console.log("HI")
    console.log(document.getElementById('mint-header'))
    if (document.getElementById('mint-header')) {
      console.log("HI2")
      mint();
    }
  }, [balance])

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
      checkBalance();
    };

    fetchUser();
  }, [user])

  const confirmTransaction = () => {
    return new Promise((resolve, reject) => {
      setShowWallet(
        <div className='text-center border-t border-gray-800 bg-white p-3 rounded-b-lg'>
          <h3 className='pb-3' id='mint-header'>Mint A Token!</h3>
          {balance > 0.001 ? (
            <>
              <div className='text-sm'>
                Are you sure you want to mint a token? 
                <br/>
                It will cost you 0.001 ETH.
              </div>
              <div className='pt-3 flex justify-around'>
                <TWButton
                  classMap={{
                    background: 'bg-green-200 border border-gray-600 text-gray-600 rounded-lg',
                    font: 'text-sm'
                  }}
                  onClick = {() => {
                    resolve(true);
                    setShowWallet(null)
                  }}
                >
                  Confirm
                </TWButton>
                <TWButton
                  classMap={{
                    background: 'bg-red-200 border border-gray-600 text-gray-600 rounded-lg',
                    font: 'text-sm'
                  }}
                  onClick={() => {
                    resolve(false);
                    setShowWallet(null)
                  }}
                >
                  Cancel
                </TWButton>
              </div>
            </>
          ) : (
            <div>
              <div className='pb-3 text-xs'>
                You don't have enough ETH in your wallet.
                <br/>
                You can use a credit card to mint.
              </div>
              <div className='flex justify-around'>
                <TWButton
                  classMap={{
                    background: 'bg-green-200 border border-gray-600 text-gray-600 rounded-lg',
                    font: 'text-sm'
                  }}
                >
                  Purchase
                </TWButton>
                <TWButton
                  classMap={{
                    background: 'bg-red-200 border border-gray-600 text-gray-600 rounded-lg',
                    font: 'text-sm'
                  }}
                  onClick={() => setShowWallet(null)}
                >
                  Cancel
                </TWButton>
              </div>
            </div>
          )}
        </div>
      );
    })
  }

  const showAccount = () => {
    checkBalance();

    if (showWallet) {
      setShowWallet(null);
      return;
    }
    
    setShowWallet(
      <div className='flex justify-around pb-3'>
        <TWButton
          classMap={{
            background: 'bg-white border border-gray-600 text-gray-600 rounded-lg',
            font: 'text-sm'
          }}
        >
          Dashboard
        </TWButton>
        <TWButton
          classMap={{
            background: 'bg-white border border-gray-600 text-gray-600 rounded-lg',
            font: 'text-sm'
          }}
          onClick={() => setShowWallet(null)}
        >
          Close
        </TWButton>
      </div>
    );
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
          setMessage("")
          await checkNfts();
          await checkBalance();
        },
        host
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
        <div className='absolute top-0 right-12 z-50 text-center'>
          <div className='border-b border-l border-r border-gray-800 rounded-b-lg bg-gray-100'>
            <div className='border-b border-gray-800 bg-white py-3 text-center text-lg'>
              Ethos Wallet
            </div>
            <div className='p-6'>
              <div className='text-xs text-gray-600 pb-3'>
                {user.email}
              </div>
              <div
                className='cursor-pointer'
                onClick={() => navigator.clipboard.writeText(user.wallet.address)}
              >
                <div className='text-sm -mb-3'>
                  Wallet Address
                </div>
                
                <div className='text-xs text-gray-600'>
                  {user.wallet.address.substr(0,24)}... 
                  <span               
                    className='text-2xl font-bold ml-1 h-3 cursor-pointer'
                  >
                    &#x2398;
                  </span>
                </div>
              </div>
              <div className='text-center pt-3'>
                {balance} ETH
              </div>
            </div>
            <div>
                {showWallet}
              </div>
          </div>  
        </div>
      )} 
      <div className='container mx-auto'>
        { user && (
          <div className='border-b px-3 py-6 flex justify-between'>
            <div>NFT Gated Content Demo</div>
            <div>
              <TWButton
                classMap={{
                  margin: 'mr-6',
                  background: 'bg-white-500',
                  fontColor: 'text-gray-800',
                  border: 'border-2 rounded-lg'
                }}
                onClick={showAccount}
              >
                Wallet
              </TWButton>
              <TWButton
                classMap={{
                  background: 'bg-gray-800',
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
                          <div className='pb-12 text-sm text-gray-500'>
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
      <div className='hidden text-gray-600'>
        <div>
          <div className="relative z-10">
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
                      className="text-xl font-medium leading-6 text-gray-900"
                    >
                      Sign In
                    </div>
                    <div className="mt-3">
                      <p className="text-sm text-gray-500">
                        Click to sign in with one of these methods:
                      </p>
                    </div>

                    <div className="mt-3 py-3">
                      <p className="text-sm text-gray-300 font-bold">
                        [VARIOUS METHODS INCLUDING WALLET CONNECT]
                      </p>
                    </div>

                    <div className="mt-3">
                      <p className="text-sm text-gray-500">
                        Or enter your email and we'll send you a magic link!
                      </p>
                    </div>

                    <div className='mt-3'>
                      <input
                        type="email"
                        className="border border-gray-300 px-3 py-1 w-10/12 rounded-md"
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