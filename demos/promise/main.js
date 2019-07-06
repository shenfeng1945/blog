/**
 * 参考文章: https://juejin.im/post/5b83cb5ae51d4538cc3ec354
 */

const url = 'https://5b6d7d1dd8f3430014e796d6.mockapi.io/api/v1/records';
const Pending = 'Pending';
const FulFilled = 'FulFilled';
const Rejected = 'Rejected';
class MyPromise {
    constructor(handler) {
        this._status = Pending;
        this._value = undefined;
        this._fulfilledQueues = [];
        this._rejectedQueues = [];
        try{
          handler(this._resolve.bind(this), this._reject.bind(this))
        }catch(err){
          this._reject(err)
        }
    }

    _resolve(val) {
        if(val instanceof MyPromise){
          return val.then(this._resolve, this._reject)
        }
        setTimeout(() => {
          if(this._status === Pending){
            this._status = FulFilled;
            this._value = value;
            this._fulfilledQueues.forEach(cb => cb());
          }
        })
    }

    _reject(err) {
        setTimeout(() => {
          if(this._status === Pending){
            this._status = Rejected;
            this._value = err;
            this._rejectedQueues.forEach(cb => cb())
          }
        })
    }

    then(onFulfilled, onRejected) {
        let promise2;
        onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : v => v;
        onRejected = typeof onRejected === 'function' ? onRejected: e => {throw e};
        
        if(this._status === FulFilled){
           return (promise2 = new MyPromise((resolve, reject) => {
             setTimeout(() => {
               try{
                 let x = onFulfilled(this._value);
                 
               }catch(e){
                 reject(e)
               }
             })
           }))
        }
        
        if(this._status === Rejected){
          return (promise2 = new MyPromise((resolve, reject) => {
             setTimeout(() => {
               try{
                 let x = onRejected(this._value);
                 
               }catch(e){
                 reject(e)
               }
             })
           }))
        }
        
        if(this._status === Pending){
          return (promise2 = new MyPromise((resolve, reject) => {
            this._fulfilledQueues.push(() => {
              try{
                let x = onFulfilled(this._value);
                
              }catch(e){
                reject(e)
              }
            })
            this._rejectedQueues.push(() => {
              try{
                let x = onRejected(this._value)
                
              }catch(e){
                reject(e)
              }
            })
          }))
        }
    }
    
    _resolutionProcedure(promise2, x, resolve, reject){
      if(promise2 === x){
        return reject(new TypeError('error'))
      }
      
      if(x instanceof MyPromise){
        if(x._status === Pending){
          x.then(val => {
            this._resolutionProcedure(promise2, val ,resolve,reject)
          }, reject)
        }else{
          x.then(resolve, reject)
        }
        return;
      }
      
      
      
    }

    catch (onRejected) {
        return this.then(undefined, onRejected);
    }
    
    static resolve(value){
        if(value instanceof MyPromise) return value;
        return new MyPromise(resolve => resolve(value))
    }
    
    static reject(value){
       return new MyPromise((resolve, reject) => reject(value))
    }
    
    static all(list){
        return new MyPromise((resolve, reject) => {
            let values = [];
            let count = 0;
            for(let [i,value] of list.entries()){
                this.resolve(value).then(res => {
                    values[i] = res;
                    count ++;
                    // 最后一个异步执行完后,resolve
                    if(count === list.length) resolve(values)
                }, err => reject(err))
            }
        })
    }
    
    static race(list){
        return new MyPromise((resolve, reject) => {
            for(let value of list){
                this.resolve(value).then(res => {
                    resolve(res)
                }, err => {
                    reject(err)
                })
            }
        })
    }
    
    static finally(cb){
       return this.then(
           value => MyPromise.resolve(cb()).then(() => value),
           err => MyPromise.resolve(cb()).then(() => console.error(err))
       )
    }
}

function fetch(url) {
    return new MyPromise((resolve, reject) => {
        setTimeout(() => {
            resolve(url)
        }, 200)
    })
}

function getResult(res) {
    console.log(res, 'success')
}

function getError(err) {
    console.log(err, 'fail')
}


fetch(url).then(res => console.log(res))

