import compose from './compose';

export default function applyMiddlewares(...middlewares){
  // 返回一个重写的createStore方法，接受旧的createStore
  return function rewriteCreateStoreFunc(oldCreateStore){
    // 返回一个新的 createStore
    return function newCreateStore(reducer, initState){
      const store = oldCreateStore(reducer, initState);
      const newStore = {getState: store.getState}
      // 给每个中间件传下 store，即 logger = loggerMiddleware(store);
      // chain: [logger, exception, time];
      const chain = middlewares.map(middleware => middleware(newStore))
      store.dispatch = compose(...chain)(store.dispatch)
      return store
    }
  }
}