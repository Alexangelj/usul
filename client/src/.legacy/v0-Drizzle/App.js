import React from 'react';
import './App.css';
//import logo from './logo.svg';
import { Container, Col, Row, Form, FormGroup, FormControl, HelpBlock, Button, Modal, Table, Tab, Tabs } from 'react-bootstrap'
import BootstrapTable from 'react-bootstrap-table-next'
import Navigation from '../../components/Header/Navigation'
import Web3 from 'web3';
import getWeb3 from '../../utils/getWeb3'
import Factory from '../../artifacts/Factory.json'
import cMoat from '../../artifacts/cMOAT.json'
import pMoat from '../../artifacts/pMOAT.json'
import Udr from '../../artifacts/UDR.json'
import Stk from '../../artifacts/STK.json'
import Solo from '../../artifacts/Solo.json'
import UdrComponent from '../../components/ContractInterfaces/UdrComponent'
import FactoryComponent from '../../components/ContractInterfaces/FactoryComponent'

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      udrInstance: undefined,
      stkInstance: undefined,
      cMoatInstance: undefined,
      pMoatInstance: undefined,
      factoryInstace: undefined,
      transferTo: undefined,
      transferAmount: undefined,
      transactions: [],
      account: null,
      web3: null,
    }
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
      const stkDeployedNetwork = Stk.networks[networkId];
      const stkInstance = new web3.eth.Contract(
        Stk.abi,
        stkDeployedNetwork && stkDeployedNetwork.address,
      )

      const cMoatDeployedNetwork = cMoat.networks[networkId];
      const cMoatInstance = new web3.eth.Contract(
        cMoat.abi,
        cMoatDeployedNetwork && cMoatDeployedNetwork.address,
      )

      const pMoatDeployedNetwork = pMoat.networks[networkId];
      const pMoatInstance = new web3.eth.Contract(
        pMoat.abi,
        pMoatDeployedNetwork && pMoatDeployedNetwork.address,
      )

      const factoryDeployedNetwork = Factory.networks[networkId];
      const factoryInstance = new web3.eth.Contract(
        Factory.abi,
        factoryDeployedNetwork && factoryDeployedNetwork.address,
      )

      this.setState({ web3: web3, account: accounts[0], udrInstance: instance, stkInstance: stkInstance, cMoatInstance: cMoatInstance, pMoatInstance: pMoatInstance, factoryInstance: factoryInstance, factoryAddress: factoryDeployedNetwork.address});
    } catch (error) {
      alert(
        'Failed to load web3, accounts, or contract.'
      );
      console.error(error);
    }
  };

  render() {
    if(!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>
    }

    return (
      <div className="App">
        <Container fluid>
          <Row>
              <FactoryComponent
                instance={this.state.factoryInstance}
                factoryAddress={this.state.factoryAddress}
                web3={this.state.web3}
                account={this.state.account}
              />
          </Row>
        <Row>
          <Col>
            <UdrComponent
              instance={this.state.udrInstance}
              web3={this.state.web3}
              account={this.state.account}
            />
          </Col>
          <Col>
            <UdrComponent
              instance={this.state.stkInstance}
              web3={this.state.web3}
              account={this.state.account}
            />
          </Col>
        </Row>
        </Container>
      </div>
    );
  }
}

export default App