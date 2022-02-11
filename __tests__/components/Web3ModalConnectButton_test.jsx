import Web3ModalConnectButton from "../../components/Web3ModalConnectButton.jsx";
    
import renderer from 'react-test-renderer';
const { act } = renderer;

import { ethers } from "ethers";

import TWCircleSpinner from '../../components/TWCircleSpinner'
import TWButton from '../../components/TWButton'

describe("Web3ModalConnectButton", () => {
  const provider = {}
  const web3Modal = {
    onConnect: jest.fn(() => {})
  }
  const onConnect = jest.fn()

  // ethers.providers.Web3Provider = jest.fn(() => provider)

  let component = null;
  beforeEach(async () => {    
    await act(async () => {
      component = renderer.create(
        <Web3ModalConnectButton
          web3Modal={web3Modal}
          onConnect={onConnect}
          classMap={{
            background: 'bg-red-500'
          }}
        >
          Connect!
        </Web3ModalConnectButton>
      )
    })
  })

  it('should display a button with the children and buttonProps passed in', () => {
    const root = component.root
    const button = root.findByType(TWButton)
    expect(button.props.classMap.background).toEqual("bg-red-500")
    expect(button.props.children).toEqual("Connect!")
  })

  it("should get the provider after the user connect to a provider and pass it back through onConnect", async () => {
    expect(1).toEqual(2)
    // const root = component.root
    // const button = root.findByType(TWButton)

    // await act(async () => {
    //   button.props.onClick()
    // })

    // expect(onConnect).toHaveBeenCalledWith(provider)
  })

  it("should reset if the user closes the modal", () => {
  })

  it("should immediately pass back the provider if one is cached", () => {
  })

  it('should display a spinner if the provider has already been cached', () => {
  })

})