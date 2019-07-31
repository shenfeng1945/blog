实现一个简易版react，旨在加深对react的内部现实原理及掌握react相关的重要概念。

### 1. 基本概念: Component(组件)、instance(组件实例)、element、jsx、dom

#### Component(组件)

类组件或函数式组件，类组件可以分为普通类组件(React.Component)以及纯类组件(React.PureComponent)。下面以`Hello`组件为例，对这三类组件代码实现。

```js
// Component
class Hello extends React.Component {
  render(){
    return <h1>Hello, {this.props.nanme}</h1>
  }
}

// PurComponent
class Hello extends React.PurComponent {
  render(){
    return <h1>Hello, {this.props.name}</h1>
  }
}

// functional component
functin Hello(props){
  return  <h1>Hello, {props.name}</h1>
}
``` 

#### instance 组件实例

组件实例其实就是一个组件类实例化的结果，在react实际开中，我们并不会自己去实例化一个组件实例，但偶尔也会用到，那就是 ref 。ref 可以指向一个 dom节点 或者一个 类组件 的实例，但不能用于 函数式组件， 因为 函数式组件 不能 实例化。
[react文档](https://zh-hans.reactjs.org/docs/refs-and-the-dom.html)中写道: 
> 当 ref 属性用于自定义 class 组件时， ref 对象接受组件的挂载实例作为其 current 属性。

#### element

类组件的render方法以及函数式组件的返回值均为 element。它就是一个纯对象(plain object)，这个纯对象包含两个属性: type: (string | ReactClass) 和 props: Object， 注意 elemnt 并不是组件实例， 是对组件实例或者dom节点的描述。如果 type 是 string 类型，则表示 dom节点， 如果 type 是 function或者class 类型，则表示组件实例。

```js
// 描述 dom 节点
{
  type: 'button',
  props: {
    className: 'f-button',
    children: {
      type: 'b',
      props: {
        children: 'OK'
      }
    }
  }
}
```

```js
function Button(props){
 // ...
}

// 描述组件实例
{
  type: Button,
  props: {
    color: 'blue',
    children: 'OK'
  }
}
```

#### jsx

明白了 element, 那么 jsx 就不难理解了， jsx 只是换了一种写法， 发布来创建 element。如果没有jsx，那我们开发效率会大幅降低，且代码难以阅读和维护。

```js
const foo = <div id="foo">Hello</div>
```

其实就是定义了一个 dom 节点div，并且该节点的属性集合是 {id: 'foo'}，children 是 Hello，完全跟下面的纯对象表示是等价的: 

```js
{
  type: 'div',
  props: {
    id: 'foo',
    children: 'Hello'
  }
}
```
React 利用了 Babel 编译将 jsx 语法转换为纯对象，我们只要在 jsx 代码里加上 编译指示(pragma) 即可。将 编译指示 设置为指向 createElement 函数: /** @jsx createElement */，那么前段的 jsx 代码就会编译为: 

```js
var foo = createElement('div', {id: 'foo'}, 'Hello')
```
可以看出， jsx 的编译过程就是 `<`、`>`这种标签式 写法到 函数调用式 写法的一种转换而已。下面我们来简单实现一个 `createElement` 函数。

```js
function createElement(type, props, ...children){
  props = Object.assign({}, props);
  props.children = [].concat(...children)
      .filter(child => child !== null && child !== false)
      .map(child => child instanceof Object ? object : createTextElement(child))
  return {type, props}
}

```

#### dom

文档对象模型，我们可以这样创建一个dom节点 div:

```js
const divDomNode = window.document.createElement('div');
```

其实所有的dom节点都是 HTMLElement类 的实例，我们可以在控制台验证下: 

```js
window.document.createElement('div') instanceof window.HTMLElement; 
// true
```

下图可以清晰描述这几个概念之间的关系: 

![](https://i.loli.net/2019/07/31/5d4133487a8c530566.png)


### 2. 虚拟dom与diff算法

虚拟dom 就是前面介绍的 element，因为element 只是 dom节点或者组件实例的一种纯对象描述而已，并不是真正的 dom 节点，因此是 虚拟dom。

react 给我提供了声明式的组件写法，当组件的 props 或者 state 变化时组件自动更新。 整个页面其实可以对应到一颗 dom 节点树，每次组件 props 或者 state 变更首先会反射到 虚拟dom树，最终反应到页面 dom 节点树的渲染。

diff算法其实是为了提升渲染效率，试想下，如果每次组件的state或者props变化后都把所有相关的dom节点删掉在重新创建，那效率肯定非常低。所以 react 内部存在两颗 虚拟dom树， 分别表示现状以及下一个状态，setState调用之后就会触发 diff算法的执行，用下图来表示虚拟dom和diff算法的关系: 

![](https://i.loli.net/2019/07/31/5d4137b581a5895941.png)

react 组件最初渲染到页面后先生成第一帧虚拟dom，这是current指针指向第一帧。
setState 调用后会生成第二帧虚拟dom，这时next指针指向第二帧，接下来 diff 算法通过比较第二帧与第一帧的异同来更新应用到真正的dom树已完成页面更新。

setState之后是如何生成虚拟dom的? setState之后会重新调用render，生成新的返回值也就是element。

setState => 调用render => 虚拟dom树(element)

react官方对diff算法有另外一个称呼，reconcile(消除分歧)

### 3. 生命周期与diff算法

setState调用后会接着调用render生成新的虚拟dom树，而这个虚拟dom树与上一帧可能会产生如下区别: 
1. 新增了某个组件
2. 删除了某个组件
3. 更新了某个组件的部分属性

在实现diff算法的过程会在相应的时间节点调用这些生命周期函数。

这里重点说明下第一帧，我们知道react应用的入口都是: 

```js
ReactDOM.render(
  <h1>Hello World</h1>,
  document.getElementById('root')
)
```

ReactDOM.render 也会生成一颗 虚拟dom树，但这个是第一帧，没有前一帧来做diff，因此这颗虚拟dom树对应的所有组件都只会调用挂载期的生命周期函数，比如 componentDidMount、componentWillUnmount。

### 4. 实现

### 参考文章
1. [200行代码实现简版react](https://juejin.im/post/5c0c7304f265da613e22106c)