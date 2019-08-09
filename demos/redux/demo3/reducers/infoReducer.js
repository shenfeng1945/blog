// infoReducer，一个子reducer
// 注意: infoReducer接受的state是state.info
export default function infoReducer(state = {}, action){
  switch(action.type){
    case 'set_name':
       return {
         ...state,
         name: action.name
       }
    case 'set_desc':
       return {
         ...state,
         desc: action.desc
       }
    default: 
      return state
  }
}