export default function createStore(initState){
  let state = initState;
  const listeners = [];
  
  function subscribe(listener){
    listeners.push(listener);
  }
  
  function getState(){
    return state;
  }
  
  function changeState(newState){
     state = newState;
     for(let i = 0; i < listeners.length; i++){
       listeners[i]()
     }
  }
  return {
    subscribe,
    changeState,
    getState
  }
}