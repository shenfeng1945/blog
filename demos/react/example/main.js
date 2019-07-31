/** @jsx EasyReact.createElement */

import * as EasyReact from '../src/easy-react';

class App extends EasyReact.Component {
  constructor(props) {
    super(props);
    this.state = {
      lists: ['todo1'],
      val: '',
      title: 'Todo Example'
    };
  }
  render() {
    const {val, lists, title} = this.state;
    return (
      <div className="todo">
        <h1>{title}</h1>
        <div className="list">
          <input type="text" onChange={this.handlerChange.bind(this)} value={val}/>
          <button onClick={this.handlerClick.bind(this)}>Add</button>
        </div>
        <ul>
          {
             lists.map((item,i) => {
               return <Todo val={item} key={i}></Todo>
             })
          }
        </ul>
      </div>
    );
  }
  
  handlerClick(){
    const {lists,val} = this.state;
    if(val){
      this.setState({lists: [...lists,val]})
    }
  }
  
  handlerChange(e){
    this.setState({val: e.target.value})
  }
  
  componentWillMount() {
    console.log('execute componentWillMount');

  }
  
  componentDidMount() {
    console.log('execute componentDidMount');
  }
  
  componentWillUnmount() {
    console.log('execute componentWillUnmount');
  }
}

function Todo(props){
  return (
    <li>{props.val}</li>
  )
}

EasyReact.render( <App />, document.getElementById("root"));
