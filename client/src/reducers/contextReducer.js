import Web3 from "web3";
import getWeb3 from '../utils/getWeb3'

import Udr from '../artifacts/UDR.json'
import Stk from '../artifacts/STK.json'
import Solo from '../artifacts/Solo.json'

export default async function () {
    const web3 = await getWeb3();
    const accounts = await web3.eth.getAccounts();
    const networkId = await web3.eth.net.getId();
    const udrDeployedNetwork = Udr.networks[networkId];
    const udr = await new web3.eth.Contract(
            Udr.abi,
            udrDeployedNetwork && udrDeployedNetwork.address,
        );
    const stkDeployedNetwork = Stk.networks[networkId];
    const stk = await new web3.eth.Contract(
            Stk.abi,
            stkDeployedNetwork && stkDeployedNetwork.address,
        )
    const soloDeployedNetwork = Solo.networks[networkId];
    const solo = await new web3.eth.Contract(
            Solo.abi,
            soloDeployedNetwork && soloDeployedNetwork.address,
        )
    const store = {
        web3: web3,
        accounts: accounts,
        account: accounts[0],
        contracts: [
            udr,
            stk,
            solo,
        ],
    
    }

    return [
        {
            web3: web3,
            accounts: accounts,
            account: accounts[0],
            udr: udr,
            stk: stk,
            solo: solo,
        }
    ]
}
