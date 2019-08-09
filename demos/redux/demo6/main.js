import createStore from './createStore';
import reducer from './reducers/index';
import loggerMiddleware from './middlewares/loggerMiddleware';
import exceptionMiddleware from './middlewares/exceptionMiddleware';
import timeMiddleware from './middlewares/timeMiddleware';
import applyMiddlewares from './applyMiddlewares';

const textEl = document.querySelector('.text')
const increaseEl = document.querySelector('.increase')
const decreaseEl = document.querySelector('.decrease')

const store = createStore(reducer, applyMiddlewares(loggerMiddleware,exceptionMiddleware,timeMiddleware));

store.subscribe(() => {
  const state = store.getState();
  textEl.textContent = state.counter.count;
})

increaseEl.addEventListener('click', () => store.dispatch({type: 'increase'}))
decreaseEl.addEventListener('click', () => store.dispatch({type: 'decrease'}))
