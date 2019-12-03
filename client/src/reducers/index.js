import { combineReducers } from 'redux'
import product from './productReducer'

const allReducers = combineReducers({
  product: product
});

export default allReducers