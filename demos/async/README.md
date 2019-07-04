### 异步处理实战

以`查找指定目录下的最大文件`为例，感受下从

回调函数 > Promise > Generator > Async

异步处理方式的改变

#### 思路分析
1. `fs.readdir`读取某个目录下所有文件列表
2. 遍历文件列表，`fs.stat`读取文件信息，并保存在数组中
3. 过滤掉非文件类型的，利用`sort`对文件的`size`进行递减排序，返回最大的文件名

#### 回调函数

```js
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
```

代码中回调嵌套着回调，代码冗余。


#### Promise

```js
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
```

代码结构比回调函数的好了很多，`readdir`和`getStat`可以抽离出来，逻辑也清晰了，但`then`仍存在嵌套。

#### Generator

```js
const fs = require('fs');
const path = require('path');
const co = require('./lib/co.js');

function* findLargest (dir){
  const filenames = yield readdir(dir);
  const statArray = yield filenames.map(filename => getStat(dir, filename));
  const result = statArray.filter(statObj => statObj.stat.isFile()).sort((a,b) => b.stat.size - a.stat.size);
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
```
配合`co`函数库效果更好,不使用`co`的话，执行Generator函数，得到遍历器对象，调用`next`方法分别执行异步任务三个阶段。

#### Async

```js
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
```
用了`async`无需再手动执行`next`方法，基于了`Generator`和`Promise`的一层封装。

### 参考文章
1. [ES6 系列之异步处理实战](https://github.com/mqyqingfeng/Blog/issues/101)