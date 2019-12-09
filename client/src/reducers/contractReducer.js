
import Stk from '../artifacts/STK.json'
import web3Reducer from './web3Reducer'
import { getSymbol, transferToken, FETCH_SYMBOL, FETCH_NAME, FETCH_DECIMALS, FETCH_TOTAL_SUPPLY, TRANSFER_TOKEN, WITHDRAW_TOKEN } from '../actions/contractActions'


export const STK_CONNECTED = 'STK_CONNECTED'
export const STK_DISCONNECTED = 'STK_DISCONNECTED'


const ACTION_HANDLERS = {
    [FETCH_SYMBOL]: (state, action) => {
        return Object.assign({}, state, action.payload)
    },
    [FETCH_NAME]: (state, action) => {
        return Object.assign({}, state, action.payload)
    },
    [FETCH_DECIMALS]: (state, action) => {
        return Object.assign({}, state, action.payload)
    },
    [FETCH_TOTAL_SUPPLY]: (state, action) => {
        return Object.assign({}, state, action.payload)
    },
    [TRANSFER_TOKEN]: (state, action) => {
        return Object.assign({}, state, action.payload)
    },
    [WITHDRAW_TOKEN]: (state, action) => {
        return Object.assign({}, state, action.payload)
    },
}


const initialState = { 
    account: null, 
    symbol: null,
    name: null,
    decimals: null,
    totalSupply: null,
    transfer: null,
    isTransferred: false,
}
export default function contractReducer(state = initialState, action) {
    const handler = ACTION_HANDLERS[action.type]
    return handler ? handler(state, action) : state
}