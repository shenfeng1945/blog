/** @jsx EasyReact.createElement */

import * as EasyReact from './easy-react';

const randomLikes = () => Math.ceil(Math.random() * 100);

const stories = [
  {name: "React", url: "https://reactjs.org/", likes: randomLikes()},
  {name: "Node", url: "https://nodejs.org/en/", likes: randomLikes()},
  {name: "Webpack", url: "https://webpack.js.org/", likes: randomLikes()}
];

const ItemRender = props => {
  const {name, url} = props;
  return (
    <a href={url}>{name}</a>
  );
};

class App extends EasyReact.Component {
  constructor(props) {
    super(props);
    this.state = {
      num: 0
    };
    setTimeout(() => {
       this.setState({
         num: 1
       });
    }, 3000);
  }
  render() {
    return (
      <div>
        <h1>DiyReact Stories {this.state.num}</h1>
        
      </div>
    );
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

class Story extends EasyReact.Component {
  constructor(props) {
    super(props);
    this.state = { likes: Math.ceil(Math.random() * 100) };
  }
  like() {
    this.setState({
      likes: this.state.likes + 1
    });
  }
  render() {
    const { name, url } = this.props;
    const { likes } = this.state;
    const likesElement = <span />;
    const itemRenderProps = {name, url};
    return (
      <li>
        <button onClick={e => this.like()}>{likes}<b>❤️</b></button>
        <ItemRender {...itemRenderProps} />
      </li>
    );
  }
  
  // shouldcomponentUpdate() {
  //   return true;
  // }
  
  componentWillUpdate() {
    console.log('execute componentWillUpdate');
  }
  
  componentDidUpdate() {
    console.log('execute componentDidUpdate');
  }

}

EasyReact.render(<App stories={stories} />, document.getElementById("root"));
