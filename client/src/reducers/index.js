import { combineReducers } from 'redux'
import product from './productReducer'
import context from './contextReducer'
import web3Reducer from './web3Reducer'
import contractReducer from './contractReducer';

const allReducers = combineReducers({
  product: product,
  context: context,
  web3Wrapper: web3Reducer,
  contract: contractReducer,
});

export default allReducers