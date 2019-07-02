const fs = require('fs');
const path = require('path');

function findLargest(dir, cb) {
    let statArray = [];
    let errorStat = false;
    fs.readdir(dir, (dirErr, filenames) => {
        if (dirErr) { cb(dirErr); return }
        filenames.forEach((file, index) => {
            fs.stat(path.join(dir, file), (statErr, statData) => {
                if (errorStat) return;
                if (statErr) {
                    cb(statErr);
                    errorStat = true;
                    return
                }
                statArray.push({ file, stat: statData })
                if (index === filenames.length - 1) {
                    let result = statArray.filter(statObj => statObj.stat.isFile()).sort((a, b) => b.stat.size - a.stat.size)
                    cb(false, result[0].file)
                }
            })
        })
    })
}

findLargest('./images', function (err, file) {
    if (err) { console.error(res); return }
    console.log(`largest file is ${file}`)
})