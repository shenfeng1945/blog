import {combineReducers} from '../redux';
import counterReducer from './counterReducer';
import infoReducer from './infoReducer';

const reducer = combineReducers({
  counter: counterReducer,
  info: infoReducer
})

export default reducer;