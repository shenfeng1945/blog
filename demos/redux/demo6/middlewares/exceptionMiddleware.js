const exceptionMiddleware = store => next => action => {
  try{
    next(action)
  }catch(err){
    console.error('出错啦:', err)
  }
}

export default exceptionMiddleware;