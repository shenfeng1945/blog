### 状态管理器

#### 简单的状态管理器

redux是一个状态管理器，那什么是状态?状态就是数据，如计数器中count：

```js
const state = {
  count: 0
}
```

我们来使用下这个状态:

```js
console.log(state.count) // 0
```

并修改这个状态:

```js
state.count = 2;
console.log(state.count) //2
```

这样我们便实现了状态(计数)的修改和使用了。

当然上面的还存在明显问题，就是修改count之后，使用count的地方不能收到通知。我们可以使用发布-订阅模式来解决这个问题。

```js
// count 的发布订阅者实践
const state = {count: 0}
const listeners = [];

/** 订阅 */
function subscribe(listener){
  listeners.push(listener)
}

/** 通知 */
function changeState(count){
  state.count = count;
  // 当count改变的时候，通知所有的订阅者
  for(let i = 0; i < listeners.length; i++){
    listeners[i]()
  }
}
```

我们尝试使用下这个简单的技术状态管理器。

```js
// 订阅并添加回调函数,当count改变时，输入最新的count值
subscribe(() => {
  console.log('当前count:', state.count)
})

// 通过 changeState 修改 state
changeState(1)
changeState(2)
changeState(3)
```

现在我们可以看到，我们修改count的时候，会输出相应的count值。

目前代码又出现了两个新问题:

- 这个状态管理器只能管理count，不能通用
- 公共的代码要封装起来

将代码进行封装

```js
function createStore(initState){
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
```

我们使用这个状态管理器管理多个状态counter和info试下.

```js
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
```

到这里我们便完成了一个简单的状态的管理器。

需要理解的是createStore，提供了getState, subscribe和changeState三个方法。

本节完整源码见[demo1](https://github.com/shenfeng1945/blog/demos/redux/demo1)

#### 有计划的状态管理器

我们用上面的状态管理器实现一个自增，自减的计数器

```js
const state = {
  count: 0
}
const store = createStore(state);

store.subscribe(() => {
  const state = store.getState();
  console.log('curret count is', state.count)
})

// 自增
store.changeState({
  count: store.getState().count + 1
})

// 自减
store.changeState({
  count: store.getState().count - 1
})

// 随意改
store.changeState({
  count: 'hello'
})
```

上面代码可以发现，count是可以随意修改的，显然不符合我们预期。

我们需要对count进行约束，只提供自增和自减两种修改方式，外部不能修改count

我们可以分两步来解决这个问题:

- 制定一个state修改计划，告诉store, 我的修改计划是什么
- 修改`store.changeState`方法，告诉它修改state时，按照我们计划修改

我们定义一个plan函数，接受当前的state和一个action,返回改变后新的state。

```js
// action必须有一个type属性
function plan(state = {}, action){
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
```

我们把这个计划告诉store，当store.changeState以后，改变state按照提供的计划来。

```js
function createState(plan, initState){
  ...
  function changeState(action){
    state = plan(state, action);
    for(let i = 0; i < listeners.length; i++){
      listeners[i]()
    }
  }
  ...
}
```

我们来尝试用新的createStore来实现自增和自减

```js
const state = {
  count: 0
}
const store = createStore(plan, state);

store.subscribe(() => {
  const state = store.getState();
  console.log('curret count is', state.count)
})

// 自增
store.changeState({
  type: 'increase'
})
// current count is 1

// 自减
store.changeState({
  type: 'decrease'
})
// current count is 0

// 我想随意改 
store.changeState({
  count: 'hello'
})
// not work
```

到这里为止我们已经实现了一个有计划的状态管理器。

根据redux官方命名，我们把plan改成reducer，changeState改成dispatch。

本节完整源码见[demo2](https://github.com/shenfeng1945/blog/demos/redux/demo2)

### 多文件协作

#### reducer 的拆分和合并

这一小节，我们来处理reducer的问题。

我们知道reducer是个计划函数，接受老的state，返回新的state，一般项目中有很多state，每个state需要一个计划函数，如果全写在一起，那reducer函数会变得极其庞大复杂，根据经验，我们需要按组件的维度将多个计划拆分成多个reducer函数，然后通过一个函数将它们合并起来，下面我们来实现合并reducer的函数。

现在我们来管理两个state，一个counter，一个info

```js
const state = {
  counter: {
    count: 0
  },
  info: {
    name: 'curry',
    desc: 'NBA出色三分射手'
  }
}
```

它们各自的reducer为:
 
```js
// counterReducer,一个子reducer
// 注意: counterReducer接受的state是state.counter
function counterReducer(state = {}, action){
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

// infoReducer，一个子reducer
// 注意: infoReducer接受的state是state.info
function infoReducer(state = {}, action){
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
```

我们用 combineReducers 将多个子reduer函数，合并成一个reducer函数，使用如下:

```js
let reducer = combineReducers({
  counter: counterReducer,
  info: infoReducer
})
```

我们尝试实现下 combineReducers 函数

```js
function combineReducers(reducers){
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
```

本小节完整源码见[demo3](https://github.com/shenfeng1945/blog/demos/redux/demo3)

#### state的拆分与合并

上一节，我们按照组件维度拆分了reducer，再借助`combineReducers`进行合并,由于项目中state往往存在多个，如果state还是写在一起，这样会造成 state树很庞大，不直观，很难维护。我们需要拆分state，一个reducer有一个state，代码如下:

```js
// counterReducer.js
const initState = {
  count: 0
}
function counterReducer(state, action){
  if(!state) state = initState;
  // ...
}

// infoReducer.js
const initState = {
  name: 'curry',
  desc: 'NBA出色三分射手'
}
function infoReducer(state, action){
  if(!state) state = initState;
  // ...
}
```

我们修改下`createStore`函数，增加一行`dispatch({type: Symbol()})`

这样做的目的是调用createStore时,用一个不匹配任何 type 的 action,来触发 `state = reducer(state, action)`,因为action.type不匹配，每个子reducer都会进到default项，返回自己初始化的state,这样就获得了初始化的state树。

正如下面代码那样: 

```js
const store = createStore(reducer);
console.log(store.getState())
// {counter: {count: 0}, info: {...}}
```
本小节完整源码见[demo4](https://github.com/shenfeng1945/blog/demos/redux/demo4)