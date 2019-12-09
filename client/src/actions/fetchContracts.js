import STK from '../artifacts/STK.json'
import UDR from '../artifacts/UDR.json'
import SOLO from '../artifacts/Solo.json'
import { type } from 'os'

export const FETCH_CONTRACTS = 'FETCH_CONTRACTS'

const getNetworkId = async ({ getState }) => {
    return getState().web3Wrapper.web3.eth.net.getId();
}

export const contractJson = [
    STK,
    UDR,
    SOLO
]


const getContracts = async ({ getState }) => {
    const instances = []
    const networkId = await getState().web3Wrapper.web3.eth.net.getId();
    let web3 = getState().web3Wrapper.web3
    for(var i=0; i < contractJson.length; i++) {
        const DeployedNetwork = contractJson[i].networks[networkId]
        instances.push(new web3.eth.Contract(contractJson[i].abi, DeployedNetwork && DeployedNetwork.address))
    }
    return instances
}

export const fetchContracts = () => {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            if(!getState().web3Wrapper.isConnected) {
                return Promise.resolve();
            }
            getContracts({ getState })
            .then(function (instances) {
                dispatch({
                    type: FETCH_CONTRACTS,
                    payload: {contracts: instances}
                })
            })

        })
    }
    
}

export const actions = [
    fetchContracts
]
  
  
  const ACTION_HANDLERS = {
    [FETCH_CONTRACTS]: (state, action) => {
      return action.payload
    },
  }
  
  
  const initialState = { 
      contracts: [], 
    }
export default function fetchContractsReducer (state = initialState, action) {
    const handler = ACTION_HANDLERS[action.type]
    return handler ? handler(state, action) : state
  }