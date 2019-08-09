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

本节完整源码见[demo1](https://https://github.com/shenfeng1945/blog/tree/master/demos/redux/demo1)

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

本节完整源码见[demo2](https://https://github.com/shenfeng1945/blog/tree/master/demos/redux/demo2)

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

本小节完整源码见[demo3](https://https://github.com/shenfeng1945/blog/tree/master/demos/redux/demo3)

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
本小节完整源码见[demo4](https://https://github.com/shenfeng1945/blog/tree/master/demos/redux/demo4)

### 中间件 Middleware

中间件是对 dispatch 的扩展，或者说重写，增强 dispatch 的功能!

#### 记录日志

现有这么个需求，每次修改state时，打印出state修改前的值，为什么修改，state修改后的值,通过重写dispatch来实现，代码如下:

```js
store = createStore(reducer)
next  = store.dispatch;

const loggerMiddleware = action => {
  console.log('current state', store.getState())
  console.log('action', action)
  next(action)
  console.log('next state', store.getState())
}
store.dispatch = loggerMiddleware;
```

将原来的`store.dispatch`进行二次封装成一个新函数，再赋值给`store.dispatch`。

```js
store.dispatch({type: 'increase'})

// current state {counter: {count: 0}, info: {...}}
// action {type: 'increase'}
// next state {counter: {count: 1}, info: {...}}
```

等调用时控制台便会打印出`loggerMiddleware`函数的log记录。

现在我们已实现一个记录 state 修改记录的功能。

#### 记录异常

现在又有另外一个需求，需要记录每次数据出错的原因，我们扩展下 dispatch

```js
store = createStore(reducer)
next  = store.dispatch;

const exceptionMiddleware = action => {
  try{
    next(action)
  }catch(err){
    console.error('出错啦:' err)
  }
}

store.dispatch = exceptionMiddleware;
```

这样每次dispatch 出异常的时候，我们都会记录下来

#### 多中间件的合作

如果我们既要打印日志，又需要记录异常，怎么办? 很简单，将两个函数合起来。

```js
store = createStore(reducer)
next  = store.dispatch;

const loggerMiddleware = action => {
  console.log('current state', store.getState())
  console.log('action', action)
  next(action)
  console.log('next state', store.getState())
}

const exceptionMiddleware = action => {
  try{
    loggerMiddleware(action)
  }catch(err){
    console.error('出错啦:' err)
  }
}

store.dispatch = exceptionMiddleware;
```

现在代码有个严重问题，就是`exceptionMiddleware`里写死了`loggerMiddleware`,我们需要让`next(action)`变成动态的，支持任意中间件。

```js
const exceptionMiddleware = next => action => {
  try{
    next(action)
  }catch(err){
    console.error('出错啦:' err)
  }
}
// loggerMiddleware变成参数传进去
store.dispatch = exceptionMiddleware(loggerMiddleware);
```
同样的，`loggerMiddleware`函数里的`next`需由原来的`store.dispatch`改为动态传入。

```js
const loggerMiddleware = next => action => {
  console.log('current state', store.getState())
  console.log('action', action)
  next(action)
  console.log('next state', store.getState())
}

store.dispatch = exceptionMiddleware(loggerMiddleware(next));
```

这样我们便可以新建两个文件`loggerMiddleware.js`和`exceptionMiddleware.js`，用来分别单独放置这两个中间件。

此时，我们又遇到了一个问题，`loggerMiddleware`函数里，还依赖了`store`，我们把`store`作为参数传入就好了。

```js
const loggerMiddleware = store => next => action => {
  console.log('current state', store.getState())
  console.log('action', action)
  next(action)
  console.log('next state', store.getState())
}

const exceptionMiddleware = store => next => action => {
  try{
    next(action)
  }catch(err){
    console.error('出错啦:', err)
  }
}
const exception = exceptionMiddleware(store);
const logger = loggerMiddleware(store);

store.dispatch = exception(logger(next));
```

到目前为止，我们已实现了两个可以独立的中间件啦!

如果再加一个中间件，如记录修改state时的时间戳，直接写成这样既可: 

```js
const timeMiddleware = store => next => action => {
  console.log('time',new Date().getTime())
  next(action)
}

const time = timeMiddleware(store);
store.dispatch = time(exception(logger(next)))
```

#### 中间件使用方式优化

上节我们实现了可独立的中间件，但是中间件的使用不是很友好。

```js
import loggerMiddleware from './middlewares/loggerMiddleware';
import exceptionMiddleware from './middlewares/exceptionMiddleware';
import timeMiddleware from './middlewares/timeMiddleware';


const store = createStore(reducer);
const next = store.dispatch;

const logger = loggerMiddleware(store);
const exception = exceptionMiddleware(store);
const time = timeMiddleware(store);

store.dispatch = exception(time(logger(next)));
```

其实我们只需要知道三个中间件，其余细节应由`createStore`去扩展,期望可以这样使用:

```js
// 接受旧的createStore，返回新的createStore
const newCreateStore = applyMiddlewares(loggerMiddleware, exceptionMiddleware, timeMiddleware)(createStore);

store = newCreateStore(reducer, initState);
```

实现`applyMiddlewares`

```js
function applyMiddlewares(...middlewares){
  // 返回一个重写的createStore方法，接受旧的createStore
  return function rewriteCreateStoreFunc(oldCreateStore){
    // 返回一个新的 createStore
    return function newCreateStore(reducer, initState){
      const store = oldCreateStore(reducer, initState);
      // 给每个中间件传下 store，即 logger = loggerMiddleware(store);
      // chain: [logger, exception, time];
      const chain = middlewares.map(middleware => middleware(store))
      let next = store.dispatch;
      // 实现 exception(time(logger(next)))
      chain.forEach(middleware => {
        next = middleware(next);
      })
      store.dispatch = next
      return store
    }
  }
}
```

#### 让用户体验更好

现在仍存在一个小问题，使用中间件与不使用中间件时，代码书写不一样。

```js
// 使用中间件
const rewriteCreateStoreFunc = applyMiddlewares(loggerMiddleware,exceptionMiddleware,timeMiddleware)
const newCreateStore = rewriteCreateStoreFunc(createStore);
const store = newCreateStore(reducer);

// 不使用中间件
const store = createStore(reducer)
```

为了让用户统一起来，我们需改造下`createStore`,支持传入第三个参数，即`rewriteCreateStoreFunc`

```js
function createStore(reducer, initState, rewriteCreateStoreFunc){
  if(rewriteCreateStoreFunc){
    // 若存在 rewriteCreateStoreFunc ,则使用新的 createStore 
    const newCreateStore = rewriteCreateStoreFunc(createStore)
    return newCreateStore(reducer, iniState);
  }
  // ...
}
```

最终的用法:

```js
const store = createStore(reducer, undefined, applyMiddlewares(loggerMiddleware,exceptionMiddleware,timeMiddleware));
```

#### 省略initState

从上节最终的用法中，发现`createStore`传递的第二个参数`initState`是`undefined`。

这是因为在state拆分与合并章节中，我们将initState写在了每个子reducer文件里，在`createStore`调用时，就不需要传递该值了，但写成undefined的形式，代码实在不美观。

那有没有办法，在不需要传`initState`时，只用传两个参数就好，让`rewriteCreateStoreFunc`变成第二个参数?

我们只要区分下`initState`和`rewriteCreateStoreFunc`的参数类型，即可判断，调用`createStore`时，有没有传递`initState`。

```js
function createStore(reducer, initState, rewriteCreateStoreFunc){
  if(typeof initState === 'function'){
    rewriteCreateStoreFunc = initState;
    initState = undefined;
  }
  // ...
}
```

本节完整源码见[demo5](https://https://github.com/shenfeng1945/blog/tree/master/demos/redux/demo5)

### 完整的Redux

#### 退订

既然`store.subscribe()`可以订阅state的变化，那么应该支持退订才对。

`createStore`中，实现`subscribe`函数时，是将回调函数push到源数组里，要实现退订，只要把相应的回调函数从源数组里删除即可。

```js
function createStore(reducer, initState, rewriteCreateStoreFunc){
  // ...
  let listeners = [];
  function subscribe(listener){
    listeners.push(listener);
    // 添加订阅时，返回一个可支持退订的函数。
    return function (){
      const index = listeners.indexOf(listeners);
      listeners.splice(index, 1)
    }
  }
}
```

使用方式如下: 

```js
const unsubscribe = store.subscribe(() => {
  const state = store.getState();
  textEl.textContent = state.counter.count;
})

// 退订
unsubscribe();
```

#### 中间件拿到 store

现在的中间件在传递store时，如`logger = loggerMiddleware(store)`，能拿到完整的store，任意中间件都可以修改我们的`subscribe`和`dispatch`方法，按照最小开放策略，我们只用把 getState 给中间件就可以了！因为我们只允许你用 getState 方法！

```js
// applyMiddlewares.js

// const chain = middlewares.map(middleware => middleware(store))

const newStore = {getState: store.getState}
const chain = middlewares.map(middleware => middleware(newStore))
```

#### compose

在我们的 `applyMiddleware`中，将`[a, b, c]`转换为 `a(b(c(next)))`是这样实现的。

```js
let next = store.dispatch;
chain.forEach(middleware => {
  next = middleware(next)
})
store.dispatch = next
```

redux提供了一个`compose`方式，可以帮我们做这个事情。

```js
const chain = [a, b, c];
dispatch = compose(...chain)(store.dispatch)
```

看下s是如何实现的

```js
export default function compose(...funcs){
  if(funcs.length === 1){
    return funcs[0]
  }
  return funcs.reduce((a, b) => (...args) => a(b(...args)))
}
```

这样我们便可以改造下`applyMiddleware`函数里的写法。

```js
// applyMiddleware.js

// 改之前代码
let next = store.dispatch;
chain.forEach(middleware => {
  next = middleware(next)
})
store.dispatch = next

// 改之后代码
store.dispatch = compose(...chain)(store.dispatch);
```

#### 2 行代码的 replaceReducer

在将reducer拆分后，和组件时一一对应的。我们希望在做按需加载时，reducer也可以跟着组件在必要的时候在加载，然后用新的reducer替换老的reducer。

```js
function createStore(reducer, initState, rewriteCreateStoreFunc){
  ...
  
  function replaceReducer(newReducer){
    reducer = nextReducer;
    dispatch({type: Symbol()})
  }
  
  ...
  
  return {
    ...
    replaceReducer
  }
}

```

我们尝试使用下:

```js
const reducer = combineReducers({
  counter: counterReducer
})
const store = createStore(reducer)

// 生成新的reducer
const newReducer = combineReducer({
  counter: counterReducer,
  info: infoReducer
})

const store = replaceReducer(newReducer)
```

完整redux源码见[demo6](https://https://github.com/shenfeng1945/blog/tree/master/demos/redux/demo6)

### 最佳实践

#### 纯函数

相同的输入，永远会得到相同的输出，而且没有任何可观察的副作用。

通俗来讲，有需符合两个要素

1. 相同的输入，一定会得到相同的输出
2. 不会有'触发事件'，更改输入参数，依赖外部参数，打印log等副作用。

```js
// 不是纯函数，同样的输入，输出结果不一致
function a(count){
  return count + Math.random()
}

// 不是纯函数，因为外部的arr被修改了
let arr = [1, 2]
function b(arr){
  return arr.push(3)
}
b(arr)

// 不是纯函数，因为依赖了外部的x
let x = 1
function c(count){
  return count + x
}
```

我们的reducer计划函数，就必须是一个纯函数!

只有传入参数相同，返回计算得到的下一个 state 就一定相同。没有特殊情况、没有副作用，没有 API 请求、没有变量修改，单纯执行计算。

![](https://i.loli.net/2019/08/09/7wMXnRTEzUACbjy.png)
redux流程图


#### 参考文章

1. [完全理解 redux（从零实现一个 redux）](https://github.com/brickspert/blog/issues/22)