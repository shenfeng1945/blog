import createStore from './createStore';

const state = {
  counter: {
    count: 0
  },
  info: {
    name: '',
    desc: ''
  }
}
const store = createStore(state);

store.subscribe(() => {
  const state = store.getState();
  console.log(`${state.info.name} 是 ${state.info.desc}`)
})

store.subscribe(() => {
  const state = store.getState();
  console.log('current count is', state.counter.count)
})

store.changeState({
  ...store.getState(),
  info: {
    name: 'curry',
    desc: 'NAB出色三分射手'
  }
})

store.changeState({
  ...store.getState(),
  counter: {count: 1}
})