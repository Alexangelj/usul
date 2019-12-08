import Stk from '../artifacts/STK.json'
import getWeb3 from './getWeb3'


const getContracts = ({ getState }) => {
    const web3 = getState();
    const networkId = web3.eth.net.getId();
    const stkDeployedNetwork = Stk.networks[networkId];
    const stkInstance = new web3.eth.Contract(
      Stk.abi,
      stkDeployedNetwork && stkDeployedNetwork.address,
    )
    return stkInstance
}