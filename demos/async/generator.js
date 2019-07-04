const fs = require('fs');
const path = require('path');
const co = require('./lib/co.js');

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




co(findLargest, './images').then(file => {
    console.log(`largest file is ${file}`)
}).catch(err => console.error(err))



// 不使用co模板
const data = findLargest('./images');
data.next().value.then(filenames => {
    const statArray = data.next(filenames);
    return Promise.all(statArray.value)
}).then(res => {
    console.log(`largest file is ${data.next(res).value}`)
});



