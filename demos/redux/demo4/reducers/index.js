import combineReducers from '../combineReducers';
import counterReducer from './counterReducer';
import infoReducer from './infoReducer';

const reducer = combineReducers({
  counter: counterReducer,
  info: infoReducer
})

export default reducer;