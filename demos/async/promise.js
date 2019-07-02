const fs = require('fs');
const path = require('path');

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
            resolve({file: filename, stat});
        })
    })
}

function findLargest(dir) {
    return readdir(dir).then(filenames => {
        let promises = filenames.map(filename => getStat(dir, filename));
        return Promise.all(promises).then(res => {
          let result = res.filter(statObj => statObj.stat.isFile()).sort((a,b) => b.stat.size - a.stat.size);
          return result[0].file
        })
    })
}


findLargest('./images').then(file => {
    console.log(`largest file is ${file}`)
}).catch(err => console.error(err))