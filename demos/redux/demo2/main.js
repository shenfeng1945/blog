import createStore from './createStore';
import reducer from './reducers/index';

const textEl = document.querySelector('.text')
const increaseEl = document.querySelector('.increase')
const decreaseEl = document.querySelector('.decrease')

const state = {
  count: 0
}
const store = createStore(reducer, state);

textEl.textContent = state.count;

store.subscribe(() => {
  const state = store.getState();
  textEl.textContent = state.count;
})

increaseEl.addEventListener('click', () => store.dispatch({type: 'increase'}))
decreaseEl.addEventListener('click', () => store.dispatch({type: 'decrease'}))
