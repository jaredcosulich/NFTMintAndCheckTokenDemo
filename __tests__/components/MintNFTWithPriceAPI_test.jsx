import renderer from 'react-test-renderer';
const { act } = renderer;

import TWCircleSpinner from '../../components/TWCircleSpinner'

import mintWithStatusMessages from '../../lib/mintWithStatusMessages'
jest.mock('../../lib/mintWithStatusMessages')

import MintPriceAndButton from '../../components/MintPriceAndButton'
jest.mock('../../components/MintPriceAndButton')

describe("MintNFTWithPrice", () => {
  const provider = jest.fn()
  const contract = jest.fn()
  const onMint = jest.fn()

  let component = null;
  beforeEach(async () => { 
    MintPriceAndButton.mockImplementation(
      ({mint}) => <button onClick={mint} />
    )
       
    await act(async () => {
      component = renderer.create(
        <MintNFTWithPrice
          provider={provider}
          contract={contract}
          onMint={onMint}
        />
      )
    })
  })

  it("should render the minting button", () => {
    const buttons = component.root.findAllByType(MintPriceAndButton)
    expect(buttons).toHaveLength(1)
  })

  it("should show a minting message when the mint is triggered", async () => {
    const spinners = component.root.findAllByType(TWCircleSpinner)
    expect(spinners).toHaveLength(0);

    const mintButton = component.root.findByType('button')
    await act(async () => {
      mintButton.props.onClick()
    })
   
    const spinner = component.root.findByType(TWCircleSpinner)
    expect(spinner.props.message).toEqual('Minting in progress...')
  })

  it("should display status messages", async () => {
    mintWithStatusMessages.mockImplementation(
      ({ onStatusChange }) => {
        onStatusChange("Status changed!")
      }
    )
    
    const mintButton = component.root.findByType('button')
    await act(async () => {
      mintButton.props.onClick()
    })

    const spinner = component.root.findByType(TWCircleSpinner)
    expect(spinner.props.message).toEqual('Status changed!')
  })

  it("should reset with a failure message if it fails", async () => {
    mintWithStatusMessages.mockImplementation(
      ({ onStatusChange, onFailure }) => {
        onStatusChange("Failed!")
        onFailure()
      }
    )
    
    const mintButton = component.root.findByType('button')
    await act(async () => {
      mintButton.props.onClick()
    })

    const spinners = component.root.findAllByType(TWCircleSpinner)
    expect(spinners).toHaveLength(0)

    const message = component.root.findByType('p')
    expect(message.props.children).toEqual('Failed!')
  })

  it("should call onMint when minting completes", async () => {
    mintWithStatusMessages.mockImplementation(
      ({ onMint }) => onMint()
    )
    
    const mintButton = component.root.findByType('button')
    await act(async () => {
      mintButton.props.onClick()
    })

    expect(onMint).toHaveBeenCalledTimes(1)
  })

})