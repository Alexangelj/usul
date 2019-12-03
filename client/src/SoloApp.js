import React from 'react';
import './App.css';
//import logo from './logo.svg';
import { Container, Col, Row, Form, FormGroup, FormControl, HelpBlock, ButtonToolbar, Modal, Table, Tab, Tabs, Card, CardDeck, CardGroup, Nav } from 'react-bootstrap'
import BootstrapTable from 'react-bootstrap-table-next'
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import Web3 from 'web3';
import getWeb3 from './getWeb3'
import Udr from './artifacts/UDR.json'
import Stk from './artifacts/STK.json'
import Solo from './artifacts/Solo.json'
import SoloComponent from './components/SoloComponent'
import UdrComponent from './components/UdrComponent'
import StkComponent from './components/StkComponent'
import { bool } from 'prop-types';
import { Button, StyledRow, H1, StyledCol } from './theme/components'
import styled from 'styled-components'
import WalletComponent from './components/WalletComponent'
import FaqComponent from './components/FaqComponent'
import HowToComponent from './components/HowToComponent'
import ChainComponent from './components/ChainComponent'
import AdminComponent from './components/AdminComponent'
import TransferComponent from './components/TransferComponent'
import Transfers from './components/Transfers'

import ToggleButton from 'react-toggle-button'

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
          unlocked: null,
          data: null,
        }
        this.handleApproveStk = this.handleApproveStk.bind(this);
        this.handleApproveUdr = this.handleApproveUdr.bind(this);
        this.handleLock = this.handleLock.bind(this);
        this.handleWithdrawStk = this.handleWithdrawStk.bind(this);
        this.handleWithdrawUdr = this.handleWithdrawUdr.bind(this);
        this.handleOptionSelect = this.handleOptionSelect.bind(this);
        this.handleSoloUpdate = this.handleSoloUpdate.bind(this);
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
        
        fetch('https://api.etherscan.io/api?module=stats&action=ethsupply&apikey=YourApiKey')
        .then(result => this.setState({ data: result}))
        .catch(error => this.setState({ error }));
        console.log('data', this.state.data)
      } catch (error) {
        alert(
          'Failed to load web3, accounts, or contract.'
        );
        console.error(error);
      }
    };

    componentWillUpdate = async (newProps, newState) => {
      console.log('newProps', newProps)
      console.log('newState', newState)
    }

    componentDidUpdate = async (newProps, newState) => {
      console.log('newProps', newProps)
    }
    
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

      let approvedUdr = await this.state.udrInstance.methods.allowance(this.state.account, this.state.solo_address).call()
      let approvedStk = await this.state.stkInstance.methods.allowance(this.state.account, this.state.solo_address).call()
      
      if(approvedUdr == 0) {
        this.setState({udrUnlocked: false})
      } else { this.setState({udrUnlocked: true}) }
      if(approvedStk == 0) {
        this.setState({stkUnlocked: false})
      } else { this.setState({stkUnlocked: true}) }
      
      
      
      this.setState((state, props) => ({activeSymbol: this.state.soloSymbol}))
    }


    async handleApproveStk(event) {
        if(typeof this.state.stkInstance !== 'undefined' && !this.state.stkUnlocked) {
            console.log('Unlocking Strike Asset')
            let result = await this.state.stkInstance.methods.approve(this.state.solo_address,
                this.state.web3.utils.toWei('1000000'))
                .send({from: this.state.account})
            this.setState({stkUnlocked: true})
            console.log('STK Unlocked')
        } else {
            console.log('Locking Strike Asset')
            let result = await this.state.stkInstance.methods.approve(this.state.solo_address,
                this.state.web3.utils.toWei('0'))
                .send({from: this.state.account})
            this.setState({stkUnlocked: false})
            console.log('STK Locked')
        }
        if(!this.state.udrUnlocked && !this.state.stkUnlocked) {
          this.setState({unlocked: false})
        return this.state.unlocked
        }
        return this.state.stkUnlocked
    }


    async handleApproveUdr(event) {
        if(typeof this.state.udrInstance !== 'undefined' && !this.state.udrUnlocked) {
            console.log('Unlocking Underlying Asset')
            let result = await this.state.udrInstance.methods.approve(this.state.solo_address,
                this.state.web3.utils.toWei('1000000'))
                .send({from: this.state.account})
            this.setState({udrUnlocked: true})
            console.log('Udr Unlocked')
        } else {
          console.log('Locking Underlying Asset')
          let result = await this.state.udrInstance.methods.approve(this.state.solo_address,
              this.state.web3.utils.toWei('0'))
              .send({from: this.state.account})
          this.setState({udrUnlocked: false})
          console.log('Udr Locked')
        }
        if(!this.state.udrUnlocked && !this.state.stkUnlocked) {
          this.setState({unlocked: false})
        return this.state.unlocked
        }
        return this.state.udrUnlocked
    }


    async handleWithdrawUdr(event) {
      if(typeof this.state.udrInstance !== 'undefined') {
          console.log('Withdrawing Underlying Asset')
          let tx = await this.state.udrInstance.methods.withdraw(
              this.state.web3.utils.toWei('100'))
              .send({from: this.state.account})
          console.log('Udr Withdrawn')
          const udrBalance = await this.state.udrInstance.methods.balanceOf(this.state.account).call()
          
          this.setState({
            udrBalance: this.state.web3.utils.fromWei(udrBalance, 'ether'),
          });
      }
    }


    async handleWithdrawStk(event) {
      if(typeof this.state.stkInstance !== 'undefined') {
          console.log('Withdrawing Strike Asset')
          let tx = await this.state.stkInstance.methods.withdraw(
              this.state.web3.utils.toWei('100'))
              .send({from: this.state.account})
          console.log('Stk Withdrawn')
          const stkBalance = await this.state.stkInstance.methods.balanceOf(this.state.account).call()
        
        this.setState({
          stkBalance: this.state.web3.utils.fromWei(stkBalance, 'ether'),
        });
      }
    }

    
    async handleLock(event){
      if(!this.state.udrUnlocked && !this.state.stkUnlocked) {
        this.setState({unlocked: false})
      return this.state.unlocked
      }
    }


    async handleSoloUpdate(event) {
      if(typeof this.state.soloInstance !== 'undefined') {
        const soloBalance = await this.state.soloInstance.methods.balanceOf(this.state.account).call()
        
        this.setState({
          soloBalance: this.state.web3.utils.fromWei(soloBalance, 'ether'),
        });
      }
    }


    handleOptionSelect(symbol){
      console.log('Clicked Row', symbol)
      this.setState({activeSymbol: symbol}, () => {
        console.log('State finished setting, ', this.state.activeSymbol)
      })
    }


    chartData() {
      fetch('http://api.etherscan.io/api?module=account&action=tokentx&address=0x152Ac2bC1821C5C9ecA56D1F35D8b0D8b61187F5&startblock=0&endblock=999999999&sort=asc&apikey=FE3PBNQ31BBZ1K2A9G8AE2IX5E13W4YSZC')
      .then(({ data }) => this.setState({ data: data }), console.log('data', this.state.data));
    }

    render() {
      if(!this.state.web3) {
        return <div>Loading Web3, accounts, and contract...</div>
      }
      let contract = <h1 className='text-center'>Choose an Option Above</h1>;
      let admin = <Button className='text-center'>Admin</Button>
      
      if(this.state.activeSymbol == this.state.stkSymbol) {
        contract =  <StkComponent
                      instance={this.state.stkInstance}
                      web3={this.state.web3}
                      account={this.state.account}
                    />;
      }

      
      if(this.state.activeSymbol == this.state.udrSymbol) {
        contract =  <UdrComponent
                      instance={this.state.udrInstance}
                      web3={this.state.web3}
                      account={this.state.account}
                    />;
      }

      if(this.state.account == this.state.admin) {
        admin = <AdminComponent
                  instance={this.state.soloInstance}
                  web3={this.state.web3}
                  account={this.state.account}
                />
      }

      if(this.state.activeSymbol == this.state.soloSymbol) {
        contract = <SoloComponent
                    soloInstance={this.state.soloInstance}
                    udrInstance={this.state.udrInstance}
                    stkInstance={this.state.stkInstance}
                    web3={this.state.web3}
                    account={this.state.account}
                    solo_address={this.state.solo_address}
                    udr_address={this.state.udr_address}
                    stk_address={this.state.stk_address}
                    handleSoloUpdate={this.handleSoloUpdate}
                  />;
      }


      if(!this.state.udrUnlocked && !this.state.stkUnlocked) {
        return (
          <Container>
            <Row>
            <Col></Col>
              <StyledCol>
                  <WalletComponent
                    soloSymbol={this.state.soloSymbol}
                    soloBalance={this.state.soloBalance}
                    udrSymbol={this.state.udrSymbol}
                    udrBalance={this.state.udrBalance}
                    stkSymbol={this.state.stkSymbol}
                    stkBalance={this.state.stkBalance}
                    handleApproveStk={this.handleApproveStk}
                    handleApproveUdr={this.handleApproveUdr}
                    handleWithdrawStk={this.handleWithdrawStk}
                    handleWithdrawUdr={this.handleWithdrawUdr}
                    udrUnlocked={this.state.udrUnlocked}
                    stkUnlocked={this.state.stkUnlocked}
                    unlocked={this.state.unlocked}
                  />
              </StyledCol>
            <Col></Col>
            </Row>
          </Container>
        );
      }
      if(this.state.udrUnlocked || this.state.stkUnlocked){
        return (
          <>
          <Container fluid>
          <h1 className='text-center'>The Solo Contract: The Right to Purchase Underlying Assets for Strike Assets <br/></h1>
                <p className='text-center'>version: alpha v0.1.0</p>
                <HowToComponent
                  soloRatio={this.state.soloRatio}
                />
            <Row>
            <Col>
              <ChainComponent 
                  soloInstance={this.state.soloInstance}
                  udrInstance={this.state.udrInstance}
                  stkInstance={this.state.stkInstance}
                  web3={this.state.web3}
                  account={this.state.account}
                  solo_address={this.state.solo_address}
                  udr_address={this.state.udr_address}
                  stk_address={this.state.stk_address}
                  handleOptionSelect={this.handleOptionSelect}
              />
              </Col>
            </Row>
            </Container>
            <Container fluid>
            <Row>
            <Col>
              <WalletComponent
                    soloSymbol={this.state.soloSymbol}
                    soloBalance={this.state.soloBalance}
                    udrSymbol={this.state.udrSymbol}
                    udrBalance={this.state.udrBalance}
                    stkSymbol={this.state.stkSymbol}
                    stkBalance={this.state.stkBalance}
                    handleApproveStk={this.handleApproveStk}
                    handleApproveUdr={this.handleApproveUdr}
                    handleWithdrawStk={this.handleWithdrawStk}
                    handleWithdrawUdr={this.handleWithdrawUdr}
                    udrUnlocked={this.state.udrUnlocked}
                    stkUnlocked={this.state.stkUnlocked}
                    unlocked={this.state.unlocked}
              />
              <TransferComponent
                instance={this.state.soloInstance}
                web3={this.state.web3}
                account={this.state.account}
                handleSoloUpdate={this.handleSoloUpdate}
              />
              </Col>
              <Col xs={9}>
              {contract}
              </Col>
              </Row>
          </Container>
          </>
        );
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
                handleApproveStk={this.handleApproveStk}
                handleApproveUdr={this.handleApproveUdr}
                handleSoloUpdate={this.handleSoloUpdate}
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