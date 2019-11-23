import React from 'react';
import './App.css';
//import logo from './logo.svg';
import { Container, Col, Row, Form, FormGroup, FormControl, HelpBlock, Button, Modal } from 'react-bootstrap'
import Web3 from 'web3';
import getWeb3 from './getWeb3'
import cMoat from './artifacts/cMOAT.json'
import Udr from './artifacts/UDR.json'

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      udrInstance: undefined,
      transferTo: undefined,
      transferAmount: undefined,
      account: null,
      web3: null
    }
    this.handleTransfer = this.handleTransfer.bind(this)
    this.handleChange = this.handleChange.bind(this)
  }

  componentDidMount = async () => {
    try {
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = Udr.networks[networkId];
      const instance = new web3.eth.Contract(
        Udr.abi,
        deployedNetwork && deployedNetwork.address,
      );

      this.setState({ web3: web3, account: accounts[0], udrInstance: instance});
      //this.addEventListener(this)

    } catch (error) {
      alert(
        'Failed to load web3, accounts, or contract.'
      );
      console.error(error);
    }
  };


  handleChange(event){
    switch(event.target.name) {
      case 'transferTo':
        this.setState({'transferTo': event.target.value})
        break;
      case 'transferAmount':
        this.setState({'transferAmount': event.target.value})
        break;
      default:
        break;
    }
  }

  async handleTransfer(event) {
    if(typeof this.state.udrInstance !== 'undefined') {
      event.preventDefault();
      let result = await this.state.udrInstance.methods.transfer(this.state.transferTo, this.state.transferAmount).send({from: this.state.account})
    }
  }

  render() {
    if(!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>
    }
    return (
      <div className="App">
        <h1>Good to Go!</h1>
        <div>The UDR Contract Name is: {this.state.name}</div>
          <Modal.Dialog>
            <Modal.Title>Tranfer {this.state.name}</Modal.Title>
            <Modal.Body>
              <Form onSubmit={this.handleTransfer}>
                <FormGroup controlId="fromTransferUdr">
                  <FormControl 
                    componentclass="textarea"
                    name="transferTo"
                    value={this.state.transferTo}
                    placeholder="Enter Transfer 'to' address"
                    onChange={this.handleChange}
                  />
                  <Form.Text>Enter Transfer data</Form.Text>
                  <FormControl
                    type="text"
                    name='transferAmount'
                    value={this.state.transferAmount}
                    placeholder='Enter transfer amount'
                    onChange={this.handleChange}
                  />
                  <Form.Text>Transfer amount</Form.Text>
                  <Button type='submit'>Transfer</Button>
                </FormGroup>
              </Form>
            </Modal.Body>
          </Modal.Dialog>
      </div>
    );
  }
}

export default App