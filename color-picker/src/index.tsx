import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import App from './App';
import React, { Component } from 'react';


class Root extends Component {
  render() {
    return (
        <App />
    )
  }
}

ReactDOM.render(<Root />, document.getElementById('root'));
serviceWorker.unregister();
