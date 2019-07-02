const fs = require('fs');
const path = require('path');
// const co = require('./lib/co.js');

const readdir = dir => {
    return new Promise((resolve, reject) => {
        fs.readdir(dir, (dirErr, filenames) => {
            if (dirErr) reject(dirErr);
            resolve(filenames)
        })
    })
}

const getStat = (dir, filename) => {
    return new Promise((resolve, reject) => {
        fs.stat(path.join(dir, filename), (statErr, stat) => {
            if (statErr) reject(statErr);
            resolve({ file: filename, stat });
        })
    })
}

function* findLargest(dir) {
    const filenames = yield readdir(dir);
    const statArray = yield filenames.map(filename => getStat(dir, filename));
    const result = statArray.filter(statObj => statObj.stat.isFile()).sort((a, b) => b.stat.size - a.stat.size);
    return result[0].file
}

function co(gen) {
    const ctx = this;
    const args = Array.prototype.slice.call(arguments, 1);
    return new Promise((resolve, reject) => {
        if (typeof gen === 'function') gen = gen.apply(ctx, args);
        if (!gen || typeof gen.next !== 'function') return resolve(gen);

        onFulfilled()


        function onFulfilled(res) {
            let ret;
            try {
                ret = gen.next(res)
            } catch (e) { reject(e) }
            next(ret)
            return null
        }
        
        function onRejected(err){
            let ret;
            try{
                ret = gen.throw(err)
            }catch(e){return reject(e)}
            next(ret)
        }

        // {value: , done:  }
        function next(ret) {
            if (ret.done) return resolve(ret.value)
            let promise = toPromise.call(ctx, ret.value);
            console.log(promise && isPromise(promise))
            if(promise && isPromise(promise)) return promise.then(onFulfilled, onRejected)
        }

        function toPromise(obj) {
            if (!obj) return obj;
            // 是promise了
            if (isPromise(obj)) return obj;
            // 遍历器对象
            if (isGeneratorFunction(obj)) return co.call(this, obj);
            // 普通函数
            if ('function' === typeof obj) return thunkToPromise.call(this, obj);
            if(Array.isArray(obj)) return arrayToPromise;
            if(isObject(obj)) return objectToPromise.call(this, obj);
            return obj
        }

        function isPromise(obj) {
            return typeof obj.then === 'function'
        }
        function isGeneratorFunction(obj) {
            const { constructor } = obj;
            if (constructor.name === 'GeneratorFunction' || constructor.displayName === 'GeneratorFunction') return true;
        }
        /**
         * JavaScript 语言是传值调用，它的 Thunk 函数含义有所不同。
         * 在 JavaScript 语言中，Thunk 函数替换的不是表达式，而是多参数函数，
         * 将其替换成单参数的版本，且只接受回调函数作为参数。
         */

        // 正常版本的readFile（多参数版本）
        // fs.readFile(fileName, callback);

        // Thunk版本的readFile（单参数版本）
        // var readFileThunk = Thunk(fileName);
        // readFileThunk(callback);

        // var Thunk = function (fileName) {
        //     return function (callback) {
        //         return fs.readFile(fileName, callback);
        //     };
        // };

        function thunkToPromise(fn) {
            var ctx = this;
            return new Promise((resolve, reject) => {
                fn.call(ctx, (err, res) => {
                    if (err) reject(err);
                    if(arguments.length > 2) res = Array.prototype.slice(arguments, 1)
                    resolve(res)
                })
            })
        }
        
        function objectToPromise(obj){
            var results = new obj.constructor();
            var keys = Object.keys(obj);
            var promises = [];
            for (var i = 0; i < keys.length; i++) {
              var key = keys[i];
              var promise = toPromise.call(this, obj[key]);
              if (promise && isPromise(promise)) defer(promise, key);
              else results[key] = obj[key];
            }
            return Promise.all(promises).then(function () {
              return results;
            });
          
            function defer(promise, key) {
              // predefine the key in the result
              results[key] = undefined;
              promises.push(promise.then(function (res) {
                results[key] = res;
              }));
            }
          }
        
        function arrayToPromise(arr){
            return Promise.all(arr.map(toPromise, this))
        }
        function isObject(obj){
            return Object === obj.constructor
        }
    })
}



co(findLargest, './images').then(file => {
    console.log(`largest file is ${file}`)
}).catch(err => console.error(err))



// 不使用co模板
// const data = findLargest('./images');
// data.next().value.then(filenames => {
//     const statArray = data.next(filenames);
//     return Promise.all(statArray.value)
// }).then(res => {
//     console.log(`largest file is ${data.next(res).value}`)
// });



