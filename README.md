This component takes a web3modal instance and provides a button to trigger the modal.

Once the wallet is selected the onConnect callback will be called with a [Provider](https://docs.ethers.io/v5/api/providers/provider/).

If the user clicks away from the modal then the state of the component will be reset.

All props besides "onConnect" and "web3Modal" are passed to the button, including the children of the component, which should likely be the text of the button. 