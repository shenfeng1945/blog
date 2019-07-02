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



