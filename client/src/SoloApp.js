import React from 'react';
import './App.css';
//import logo from './logo.svg';
import { Container, Col, Row, Form, FormGroup, FormControl, HelpBlock, ButtonToolbar, Modal, Table, Tab, Tabs, Card, CardDeck, CardGroup } from 'react-bootstrap'
import BootstrapTable from 'react-bootstrap-table-next'
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import Web3 from 'web3';
import getWeb3 from './getWeb3'
import Udr from './artifacts/UDR.json'
import Stk from './artifacts/STK.json'
import Solo from './artifacts/Solo.json'
import SoloComponent from './components/SoloComponent'
import UdrComponent from './components/UdrComponent'
import { bool } from 'prop-types';
import { Button, StyledRow, H1 } from './theme/components'
import styled from 'styled-components'
import WalletComponent from './components/WalletComponent'
import FaqComponent from './components/FaqComponent'
import HowToComponent from './components/HowToComponent'





class SoloApp extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
          admin: undefined,
          soloInstance: undefined,
          solo_address: undefined,
          udrInstance: undefined,
          udr_address: undefined,
          stkInstance: undefined,
          stk_address: undefined,
          soloBalance: undefined,
          udrBalance: undefined,
          stkBalance: undefined,
          soloSymbol: undefined,
          udrSymbol: undefined,
          stkSymbol: undefined,
          soloRatio: undefined,
          stkUnlocked: bool,
          udrUnlocked: bool,
          balances: [],
          transferTo: undefined,
          transferAmount: undefined,
          transactions: [],
          account: null,
          web3: null,
        }
        this.handleApproveStk = this.handleApproveStk.bind(this);
        this.handleApproveUdr = this.handleApproveUdr.bind(this);
      }
    
      
    componentDidMount = async () => {
      try {
        const web3 = await getWeb3();
        const accounts = await web3.eth.getAccounts();
        const networkId = await web3.eth.net.getId();
        const udrDeployedNetwork = Udr.networks[networkId];
        const udrInstance = new web3.eth.Contract(
          Udr.abi,
          udrDeployedNetwork && udrDeployedNetwork.address,
        );
        const stkDeployedNetwork = Stk.networks[networkId];
        const stkInstance = new web3.eth.Contract(
          Stk.abi,
          stkDeployedNetwork && stkDeployedNetwork.address,
        )

        const soloDeployedNetwork = Solo.networks[networkId];
        const soloInstance = new web3.eth.Contract(
          Solo.abi,
          soloDeployedNetwork && soloDeployedNetwork.address,
        )

        this.setState({ 
              web3: web3, 
              account: accounts[0], 
              udrInstance: udrInstance,
              udr_address: udrDeployedNetwork.address,
              stkInstance: stkInstance, 
              stk_address: stkDeployedNetwork.address,
              soloInstance: soloInstance,
              solo_address: soloDeployedNetwork.address,
          }, this.constants);
      } catch (error) {
        alert(
          'Failed to load web3, accounts, or contract.'
        );
        console.error(error);
      }
    };
    
    async constants() {
      if(typeof this.state.soloInstance !== 'undefined') {
        const soloSymbol = await this.state.soloInstance.methods.symbol().call()
        const soloBalance = await this.state.soloInstance.methods.balanceOf(this.state.account).call()
        const soloRatio = await this.state.soloInstance.methods.ratio().call()
        const admin = await this.state.soloInstance.methods.admin().call()
        this.setState({
          soloSymbol: soloSymbol, 
          soloBalance: this.state.web3.utils.fromWei(soloBalance, 'ether'),
          soloRatio: soloRatio,
          admin: admin,
        });
        console.log(this.state.admin, this.state.account)
      }
      if(typeof this.state.udrInstance !== 'undefined') {
          const udrSymbol = await this.state.udrInstance.methods.symbol().call()
          const udrBalance = await this.state.udrInstance.methods.balanceOf(this.state.account).call()
          
          this.setState({
            udrSymbol: udrSymbol, 
            udrBalance: this.state.web3.utils.fromWei(udrBalance, 'ether'),
          });
        } 
      if(typeof this.state.stkInstance !== 'undefined') {
        const stkSymbol = await this.state.stkInstance.methods.symbol().call()
        const stkBalance = await this.state.stkInstance.methods.balanceOf(this.state.account).call()
        
        this.setState({
          stkSymbol: stkSymbol, 
          stkBalance: this.state.web3.utils.fromWei(stkBalance, 'ether'),
        });
      }
      const balArray = this.state.balances.slice();
      balArray.push({_asset: this.state.soloSymbol, _amount: this.state.soloBalance});
      balArray.push({_asset: this.state.udrSymbol, _amount: this.state.udrBalance});
      balArray.push({_asset: this.state.stkSymbol, _amount: this.state.stkBalance});
      console.log(balArray);
      this.setState({balances: balArray});
    }

    async handleApproveStk(event) {
        if(typeof this.state.stkInstance !== 'undefined') {
            event.preventDefault();
            console.log('Unlocking Strike Asset')
            let result = await this.state.stkInstance.methods.approve(this.state.solo_address,
                this.state.web3.utils.toWei('1000000'))
                .send({from: this.state.account})
            let tx = await this.state.stkInstance.methods.withdraw(
                this.state.web3.utils.toWei('100'))
                .send({from: this.state.account})
        }
        this.setState({stkUnlocked: true})
    }   
    async handleApproveUdr(event) {
        if(typeof this.state.udrInstance !== 'undefined') {
            event.preventDefault();
            console.log('Unlocking Underlying Asset')
            let result = await this.state.udrInstance.methods.approve(this.state.solo_address,
                this.state.web3.utils.toWei('1000000'))
                .send({from: this.state.account})
            let tx = await this.state.udrInstance.methods.withdraw(
                this.state.web3.utils.toWei('100'))
                .send({from: this.state.account})
        }
        this.setState({udrUnlocked: true})
    }  
    

    render() {
      if(!this.state.web3) {
        return <div>Loading Web3, accounts, and contract...</div>
      }
      return (
        <div className="SoloApp">
          <Container fluid>
            <Row>
              <Col>
                <h1 className='text-center'>The Solo Contract: The Right to Purchase Underlying Assets for Strike Assets <br/></h1>
                <h5 className='text-center'>version: alpha v0.1</h5>
                <HowToComponent
                  soloRatio={this.state.soloRatio}
                />
              </Col>
            </Row>
          <Row>
            <Col>
              <WalletComponent
                soloSymbol={this.state.soloSymbol}
                soloBalance={this.state.soloBalance}
                udrSymbol={this.state.udrSymbol}
                udrBalance={this.state.udrBalance}
                stkSymbol={this.state.stkSymbol}
                stkBalance={this.state.stkBalance}
              />
            </Col>
            <Col>
              <SoloComponent
                  soloInstance={this.state.soloInstance}
                  udrInstance={this.state.udrInstance}
                  stkInstance={this.state.stkInstance}
                  web3={this.state.web3}
                  account={this.state.account}
                  solo_address={this.state.solo_address}
                  udr_address={this.state.udr_address}
                  stk_address={this.state.stk_address}
              />
            </Col>
            <Col>
              <FaqComponent
                soloRatio={this.state.soloRatio}
              />
            </Col>
        </Row>
        <Row>
            <Col>
              <UdrComponent
                instance={this.state.stkInstance}
                web3={this.state.web3}
                account={this.state.account}
              />
            </Col>
            <Col>
              <UdrComponent
                instance={this.state.udrInstance}
                web3={this.state.web3}
                account={this.state.account}
              />
            </Col>
            <Col>
              <UdrComponent
                instance={this.state.soloInstance}
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

export default SoloApp