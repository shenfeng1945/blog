import createStore from './createStore';
import reducer from './reducers/index';

const textEl = document.querySelector('.text')
const increaseEl = document.querySelector('.increase')
const decreaseEl = document.querySelector('.decrease')

const state = {
  counter: {
    count: 0
  },
  info: {
    name: 'curry',
    desc: 'NBA出色三分射手'
  }
}
const store = createStore(reducer, state);

textEl.textContent = state.counter.count;

store.subscribe(() => {
  const state = store.getState();
  textEl.textContent = state.counter.count;
})

increaseEl.addEventListener('click', () => store.dispatch({type: 'increase'}))
decreaseEl.addEventListener('click', () => store.dispatch({type: 'decrease'}))
