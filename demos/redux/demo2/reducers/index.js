export default function reducer(state = {}, action){
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