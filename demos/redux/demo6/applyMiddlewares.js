export default function applyMiddlewares(...middlewares){
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