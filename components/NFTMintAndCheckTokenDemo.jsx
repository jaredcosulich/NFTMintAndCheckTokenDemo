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
    const balance = await lib.ethBalance({ 
      network: ContractInfo.network,
      address: user.wallet.address,
      host
    });
    
    setBalance(parseInt(balance * 100000) / 100000)
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
      checkBalance();
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
                background: 'bg-red-600 text-white'
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

  const showAccount = () => {
    checkBalance();

    if (showWallet) {
      setShowWallet(null);
      return;
    }
    
    setShowWallet(
      <div className='text-center'>
        <h1 className='text-lg'>Your Account</h1>
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
        <div className='text-center py-3'>
          {balance} ETH
          <span 
            className='ml-1 font-bold cursor-pointer' 
            onClick={checkBalance}
          >
            &#x21bb;
          </span>
        </div>
        <div className='pt-3 flex justify-around'>
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
          setMessage("Minting Completed, Confirming Transaction...");
          await checkNfts();
          await checkBalance();
          setMessage("")
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
        <div className='absolute top-0 right-12 z-50'>
          <div className='border-b border-l border-r border-gray-800 rounded-b-lg bg-gray-100'>
            <div className='border-b border-gray-800 bg-white px-3 py-1 text-center text-lg'>
              Ethos Wallet
            </div>
            <div className='p-3'>
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
                          <div className='pb-3 text-sm text-gray-500'>
                            Minting costs 0.001 ETH 
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