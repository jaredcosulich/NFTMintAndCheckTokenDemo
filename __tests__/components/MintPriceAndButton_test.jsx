import MintPriceAndButton from "../../components/MintPriceAndButton.jsx";
    
import renderer from 'react-test-renderer';
const { act } = renderer;

describe("MintPriceAndButton", () => {
  const mintPriceInWei = Math.pow(10, 16).toString()
  const contract = {
    mintPrice: jest.fn(() => mintPriceInWei)
  }
  const mintFunction = jest.fn()

  let component = null;
  beforeEach(async () => {    
    await act(async () => {
      component = renderer.create(
        <MintPriceAndButton
          contract={contract}
          mint={mintFunction}
        />
      )
    })
  })

  it("should query the contract for the minting price", () => {
    expect(contract.mintPrice).toHaveBeenCalledTimes(1)
  })

  it("should display the mint price in WEI", () => {
    const pricingParagraph = component.root.findByType('p')
    const pricingText = pricingParagraph.children.join('')
    expect(pricingText).toContain('0.01 ETH')
  })

  it("should call the mint function when the button is clicked, passing in the mint price", () => {
    expect(mintFunction).not.toHaveBeenCalled()
    const mintButton = component.root.findByType('button')
    mintButton.props.onClick()
    expect(mintFunction).toHaveBeenCalledTimes(1)
    expect(mintFunction).toHaveBeenLastCalledWith(mintPriceInWei)
  })
})