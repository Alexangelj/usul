
import Stk from '../artifacts/STK.json'
import web3Reducer from './web3Reducer'

export const STK_CONNECTED = 'STK_CONNECTED'
export const STK_DISCONNECTED = 'STK_DISCONNECTED'
export const FETCH_SYMBOL = 'FETCH_SYMBOL'


const getNetworkId = async ({ getState }) => {
    return getState().web3Wrapper.web3.eth.net.getId();
}


const getDefaultAccount = ({ getState }) => {
    return getState().web3Wrapper.web3.eth.accounts[0]
}


const getContracts = async ({ getState }) => {
    const networkId = await getState().web3Wrapper.web3.eth.net.getId();
    const stkDeployedNetwork = Stk.networks[networkId];
    let web3 = getState().web3Wrapper.web3
    const stkInstance = new web3.eth.Contract(
      Stk.abi,
      stkDeployedNetwork && stkDeployedNetwork.address,
    )
    return stkInstance
}


export const getSymbol = ({ account, address }) => {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            if(!getState().web3Wrapper.isConnected) {
                return Promise.resolve();
            }
            let contract = null
            let from = null
            getContracts({ getState })
            .then(function (instance) {
                contract = instance
                from = getDefaultAccount({ getState })
                contract.methods.symbol().call({from: from})
                .then(function (result) {
                    dispatch({
                        type: FETCH_SYMBOL,
                        payload: {account, result: result}
                    })
                    resolve()
                }).catch(function (e) {
                    console.log(e)
                    reject()
                })
            })
        })
    }
}

export const actions = [
    getSymbol,
]

const ACTION_HANDLERS = {
    [FETCH_SYMBOL]: (state, action) => {
        return Object.assign({}, state, action.payload)
    }
}


const initialState = { account: null, result: null }
export default function contractReducer(state = initialState, action) {
    const handler = ACTION_HANDLERS[action.type]
    return handler ? handler(state, action) : state
}