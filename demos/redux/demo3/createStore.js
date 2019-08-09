export default function createStore(reducer, initState){
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
  return {
    subscribe,
    dispatch,
    getState
  }
}