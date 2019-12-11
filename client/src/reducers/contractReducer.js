
import Stk from '../artifacts/STK.json'
import web3Reducer from './web3Reducer'
import { 
    FETCH_CONTRACT, 
    FETCH_SYMBOL, 
    FETCH_NAME, 
    FETCH_DECIMALS, 
    FETCH_TOTAL_SUPPLY, 
    TRANSFER_TOKEN, 
    WITHDRAW_TOKEN, 
    FETCH_RATIO,
    FETCH_MATURITY,
    FETCH_ADDRESS,
    APPROVE_TOKEN,
    BUY_TOKEN,
    WRITE_TOKEN,
    CLOSE_TOKEN,
    EXERCISE_TOKEN
} from '../actions/contractActions'


export const STK_CONNECTED = 'STK_CONNECTED'
export const STK_DISCONNECTED = 'STK_DISCONNECTED'


const ACTION_HANDLERS = {
    [FETCH_CONTRACT]: (state, action) => {
        return Object.assign({}, state, action.payload)
    },
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
    [FETCH_RATIO]: (state, action) => {
        return Object.assign({}, state, action.payload)
    },
    [FETCH_MATURITY]: (state, action) => {
        return Object.assign({}, state, action.payload)
    },
    [FETCH_ADDRESS]: (state, action) => {
        return Object.assign({}, state, action.payload)
    },
    [TRANSFER_TOKEN]: (state, action) => {
        return Object.assign({}, state, action.payload)
    },
    [APPROVE_TOKEN]: (state, action) => {
        return Object.assign({}, state, action.payload)
    },
    [WITHDRAW_TOKEN]: (state, action) => {
        return Object.assign({}, state, action.payload)
    },
    [BUY_TOKEN]: (state, action) => {
        return Object.assign({}, state, action.payload)
    },
    [WRITE_TOKEN]: (state, action) => {
        return Object.assign({}, state, action.payload)
    },
    [CLOSE_TOKEN]: (state, action) => {
        return Object.assign({}, state, action.payload)
    },
    [EXERCISE_TOKEN]: (state, action) => {
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

    contract: null,
    ratio: null,
    maturity: null,
    address: null, 

    buy: null,
    isBought: null,
    write: null,
    isWrote: null,
    close: null,
    isClosed: null,
    exercise: null,
    isExercised: null,

    
}
export default function contractReducer(state = initialState, action) {
    const handler = ACTION_HANDLERS[action.type]
    return handler ? handler(state, action) : state
}