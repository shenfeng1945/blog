const url = 'https://5b6d7d1dd8f3430014e796d6.mockapi.io/api/v1/records';
const Pending = 'Pending';
const FulFilled = 'FulFilled';
const Rejected = 'Rejected';
class MyPromise {
    constructor(handler) {
        if ('function' !== typeof handler) {
            throw new Error('MyPromise must accept a function')
        }
        this._status = Pending;
        this._value = undefined;
        this._fulfilledQueues = [];
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
            let cb;
            while (cb = this._fulfilledQueues.shift()) {
                cb(val)
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
            while(cb = this._rejectedQueues.shift()){
                cb(err);
            }
        }
        setTimeout(() => run(), 0)
    }

    then(onFulfilled, onRejected) {
        const { _value, _status } = this;
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
    
    catch(onRejected){
        return this.then(undefined, onRejected);
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

fetch(url).then(getResult, getError)