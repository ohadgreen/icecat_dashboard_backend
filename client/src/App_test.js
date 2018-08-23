import React, { Component } from 'react';

import logo from './logo.svg';

import './App.css';

class AppTest extends Component {
  state = {
    message: ''
  };

  componentDidMount() {
    this.callApi()
      .then(res => this.setState({ message: res.message }))
      .catch(err => console.log(err));
  }

  callApi = async () => {
    const response = await fetch('/test');
    const body = await response.json();

    if (response.status !== 200) throw Error(body.message);
    console.log("body", body);
    return body;
  };

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">{this.state.message}</p>
      </div>
    );
  }
}

export default AppTest;