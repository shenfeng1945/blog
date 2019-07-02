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

async function findLargest(dir){
  const filenames = await readdir(dir);
  const promises = filenames.map(filename => getStat(dir, filename));
  const statArray = await Promise.all(promises);
  const result = statArray.filter(statObj => statObj.stat.isFile()).sort((a,b) => b.stat.size - a.stat.size);
  return result[0].file
}

findLargest('./images').then(file => {
    console.log(`largest file is ${file}`)
}).catch(err => console.error(err));