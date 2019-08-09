// counterReducer,一个子reducer
// 注意: counterReducer接受的state是state.counter
export default function counterReducer(state = {}, action){
  switch(action.type){
    case 'increase':
      return {
        ...state,
        count: state.count + 1
      }
    case 'decrease':
      return {
        ...state,
        count: state.count - 1
      }
    default :
      return state
  }
}