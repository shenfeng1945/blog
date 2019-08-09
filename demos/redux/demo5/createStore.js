export default function createStore(reducer, initState, rewriteCreateStoreFunc){
  if(typeof initState === 'function'){
    rewriteCreateStoreFunc = initState;
    initState = undefined;
  }

  if(rewriteCreateStoreFunc){
    const newCreateStore = rewriteCreateStoreFunc(createStore);
    return newCreateStore(reducer, initState);
  }
  
  let state = initState;
  const listeners = [];
  
  function subscribe(listener){
    listeners.push(listener);
  }
  
  function getState(){
    return state;
  }
  
  function dispatch(action){
     state = reducer(state, action);
     for(let i = 0; i < listeners.length; i++){
       listeners[i]()
     }
  }
  // 用一个不匹配任何计划的 type，来获取初始值
  dispatch({type: Symbol()})
  
  return {
    subscribe,
    dispatch,
    getState
  }
}