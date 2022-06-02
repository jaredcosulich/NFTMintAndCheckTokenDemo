import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Orbit } from '@uiball/loaders'
import {
  TWFullScreen,
  TWCenteredContent,
  WalletHasTokenFlowAPI
} from '.'

import { tailwind, lib } from 'ethos-react2';

import { ContractInfo } from '../contracts';
import { TWButton } from '.';

const appId = 'app1';

const NFTMintAndCheckTokenDemo = () => {
  const [user, setUser] = useState();
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState();
  const [nft, setNft] = useState();
  const [gated, setGated] = useState(false)

  const checkNfts = useCallback(async () => {
    const { network, address, abi } = ContractInfo;

    console.log('contract address :>> ', address);

    const transferInformation = await lib.tokenTransfers(
      network,
      user.wallet.address,
      address,
      abi
    )

    if (transferInformation.currentTokenIds.length === 0) {
      return;
    }

    console.log(transferInformation.currentTokenIds[0])

    const tokenUri = await lib.query({
      network,
      address,
      abi,
      functionName: 'tokenURI',
      inputValues: [transferInformation.currentTokenIds[0]]
    })

    const response = await fetch(tokenUri)

    if (response.status !== 200) {
      return;
    }

    const metadata = await response.text()

    try {
      JSON.parse(nft.metadata);
      console.log('==========');
      console.log('NFT Result:');
      console.log('tokenUri :>> ', tokenUri);
      console.log('response.status :>> ', response.status);
      console.log('metadata :>> ', metadata);
      console.log('==========');
      setNft({ metadata })
    } catch (error) {
      console.error('Error loading metadata from ' + response.url);
      setNft({})
    }

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
          lib.hideWallet();
          setMessage("");
        }
      })
    } catch (error) {
      console.log(error);
    }
  }

  const login = (user) => {
    if (!user) {
      setSent(true);
      return;
    }
    setUser(user);
  }

  const logout = () => {
    lib.logout(appId, false);
    setNft(null);
    setUser(null);
    setSent(false);
    setGated(false);
  }

  const enter = () => {
    setGated(true);
  }

  return (
    <TWFullScreen>
      <div className='container mx-auto'>
        {user && (
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
                  <div className='h-screen flex flex-col justify-center'>
                    <div className='flex justify-center mb-36'>
                      <Orbit />
                    </div>
                  </div>
                ) : (
                  <div className='py-36'>
                    <h2 className='text-xl pb-6'>
                      NFT Gated Content Demo
                    </h2>
                    {sent ? (
                      <div className=''>
                        An email has been sent to you with a link to login.
                        <br />
                        <br />
                        You can close this window.
                      </div>
                    ) : (
                      <tailwind.SignInButton
                        appId={appId}
                        className='bg-slate-200 px-3 py-1 rounded-lg'
                        onSignIn={login}
                      />
                    )}
                  </div>
                )}
              </>
            )}

            {/* <WalletHasTokenFlowAPI contractMetadata={ContractInfo}/> */}
          </div>
        </TWCenteredContent>
      </div>
    </TWFullScreen>
  )
}

export default NFTMintAndCheckTokenDemo;