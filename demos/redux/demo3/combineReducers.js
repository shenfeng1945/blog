export default function combineReducers(reducers){
  const reducerKeys = Object.keys(reducers);
  // 返回一个reducer，接受state和action
  // 返回的函数，是createStore传入的第一个纯函数reducer,它接受state,action生成新的state
  return function combintion(state, action){
    const newState = {}
    reducerKeys.forEach(key => {
      const reducer = reducers[key];
      newState[key] = reducer(state[key], action);
    })
    return newState
  }
}