import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Web3 from 'web3';

class App extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      symKeyID: null,
      sig: null,
      web3: null,
      error: null,
      info: null,
      data: null
    };
  }

  componentDidMount() {
    const web3 = new Web3(new Web3.providers.WebsocketProvider("ws://localhost:8546"));
    this.setState({ web3: web3 });

    Promise.all([
      web3.shh.newSymKey().then((id) => { this.setState({ symKeyID: id }); }),
      web3.shh.newKeyPair().then((id) => { this.setState({ sig: id }); })

    ]).then(() => {

      // will receive also its own message send, below
      web3.shh.subscribe("messages", {
        symKeyID: this.state.symKeyID,
        topics: ['0xffaadd11']
      }).on('data', (message) => {
        this.setState({ data: JSON.stringify(message) }); // <==== THIS IS NEVER HIT WITH PARITY!
      });

    }).then(() => {
      web3.shh.post({
        symKeyID: this.state.symKeyID, // encrypts using the sym key ID
        sig: this.state.sig, // signs the message using the keyPair ID
        ttl: 10,
        topic: '0xffaadd11', // required for geth
        topics: ['0xffaadd11'], // required for Parity
        priority: 1,
        payload: '0xffffffdddddd1122',
        powTime: 3,
        powTarget: 0.5
      }).then(h => this.setState({ info: `Message with hash ${h} was successfuly sent` }))
        .catch(err => this.setState({ error: err.message}));
    });
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        <h4>Info</h4>
        <pre>{this.state.info}</pre>
        <h4>Data received</h4>
        <pre>{this.state.data}</pre>
        <h4>Error</h4>
        <pre>{this.state.error}</pre>
        <h4>Web3 version</h4>
        <pre>{this.state.web3 ? this.state.web3.version : ''}</pre>
        <h4>Symmetric Key ID</h4>
        <pre>{this.state.symKeyID}</pre>
        <h4>Signature</h4>
        <pre>{this.state.sig}</pre>
      </div>
    );
  }
}

export default App;
