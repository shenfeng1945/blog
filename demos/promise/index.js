/**
 * 参考文章: https://juejin.im/post/5b83cb5ae51d4538cc3ec354
 */
(function(){

const Pending = 'Pending';
const FulFilled = 'FulFilled';
const Rejected = 'Rejected';
class MyPromise {
    constructor(handler) {
        // 接受一个函数作为参数
        if ('function' !== typeof handler) {
            throw new Error('MyPromise must accept a function')
        }
        this._status = Pending;
        this._value = undefined;
        // 添加成功回调函数队列
        this._fulfilledQueues = [];
        // 添加失败回调函数队列
        this._rejectedQueues = [];
        try {
            handler(this._resolve.bind(this), this._reject.bind(this));
        } catch (err) {
            this._reject(err);
        }
    }

    _resolve(val) {
        if (this._status !== Pending) return;
        const run = () => {
            this._status = FulFilled;
            this._value = val;
            const runFulfilled = (val) => {
                let cb;
                while (cb = this._fulfilledQueues.shift()) {
                    cb(val)
                }
            }
            const runRejected = (err) => {
                let cb;
                while (cb = this._rejectedQueues.shift()) {
                    cb(err)
                }
            }
            if(val instanceof MyPromise){
                val.then(value => {
                    this._value = value;
                    this._status = FulFilled;
                    runFulfilled(value)
                }, err => {
                    this._value = err;
                    this._status = Rejected;
                    runRejected(err)
                })
            }else{
                this._value = val;
                this._status = FulFilled;
                runFulfilled(val)
            }
        }
        setTimeout(() => run(), 0)
    }

    _reject(err) {
        if (this._status !== Pending) return;
        const run = () => {
            this._status = Rejected;
            this._value = err;
            let cb;
            while (cb = this._rejectedQueues.shift()) {
                cb(err);
            }
        }
        setTimeout(() => run(), 0)
    }

    then(onFulfilled, onRejected) {
        const {
            _value,
            _status
        } = this;
        return new MyPromise((onFulfilledNext, onRejectedNext) => {
            let fulfilled = value => {
                try {
                    if ('function' !== typeof onFulfilled) {
                        onRejectedNext(value)
                    } else {
                        let res = onFulfilled(value);
                        if (res instanceof MyPromise) {
                            res.then(onFulfilledNext, onFulfilledNext)
                        } else {
                            onFulfilledNext(res)
                        }
                    }
                } catch (err) {
                    onRejectedNext(err)
                }
            }
            let rejected = error => {
                try {
                    if ('function' !== typeof onRejected) {
                        onRejectedNext(error)
                    } else {
                        let res = onRejected(error);
                        if (res instanceof MyPromise) {
                            res.then(onFulfilledNext, onRejectedNext)
                        } else {
                            onFulfilledNext(res)
                        }
                    }
                } catch (err) {
                    onRejectedNext(err)
                }
            }
            switch (_status) {
                case Pending:
                    this._fulfilledQueues.push(onFulfilled);
                    this._rejectedQueues.push(onRejected);
                    break;
                case FulFilled:
                    fulfilled(_value)
                    break;
                case Rejected:
                    rejected(_value)
                    break;
            }
        })
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
window.MyPromise = MyPromise
})()