import {
  TWFullScreen,
  TWCenteredContent,
  WalletHasTokenFlowAPI
} from '.'

import { ContractInfo } from '../contracts';

const NFTMintAndCheckTokenDemo = () => {  
  return (
    <TWFullScreen>
      <TWCenteredContent>
        <WalletHasTokenFlowAPI contractMetadata={ContractInfo}/>
      </TWCenteredContent>
    </TWFullScreen>
  )
}

export default NFTMintAndCheckTokenDemo;