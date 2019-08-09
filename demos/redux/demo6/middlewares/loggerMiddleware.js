const loggerMiddleware = store => next => action => {
  console.log('current state', store.getState())
  console.log('action', action)
  next(action)
  console.log('next state', store.getState())
}

export default loggerMiddleware;