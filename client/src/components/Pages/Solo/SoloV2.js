import React, { PropTypes } from 'react';
import { Container, Col, Row, Form, FormGroup, FormControl, HelpBlock, ButtonToolbar, Modal, Table, Tab, Tabs, Card, CardDeck, CardGroup, Nav } from 'react-bootstrap'
import BootstrapTable from 'react-bootstrap-table-next'
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import Web3 from 'web3';
import getWeb3 from '../../../utils/getWeb3'
import Udr from '../../../artifacts/UDR.json'
import Stk from '../../../artifacts/STK.json'
import Solo from '../../../artifacts/Solo.json'
import SoloComponent from '../../ContractInterfaces/SoloComponent'
import UdrComponent from '../../ContractInterfaces/UdrComponent'
import StkComponent from '../../ContractInterfaces/StkComponent'
import { bool } from 'prop-types';
import { Button, StyledRow, H1, StyledCol } from '../../../theme/components'
import styled from 'styled-components'
import WalletComponent from '../../Wallet/WalletComponent'
import FaqComponent from '../FAQ/FaqComponent'
import HowToComponent from '../../Tooltips/HowToComponent'
import ChainComponent from '../../Chain/ChainComponent'
import AdminComponent from '../Admin/AdminComponent'
import TransferComponent from '../../ContractInterfaces/TransferComponent'
import Transfers from '../../ContractInterfaces/Transfers'


import ToggleButton from 'react-toggle-button'


import { connect } from 'react-redux'
import { web3Connect } from '../../../reducers/web3Reducer'
import {
  fetchContract, 
  getSymbol, 
  transferToken, 
  withdrawToken, 
} from '../../../actions/contractActions'

import ChainComponentV2 from '../../Chain/ChainComponentV2'
import Erc20ComponentV2 from '../../ContractInterfaces/Erc20ComponentV2'
import SoloComponentV2 from '../../ContractInterfaces/SoloComponentV2'
import WalletComponentV2 from '../../Wallet/WalletComponentV2'

export const STK_INDEX = 0
export const UDR_INDEX = 1
export const SOLO_INDEX = 2



class SoloV2Component extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            web3: undefined,
            activeSymbol: undefined,
        }
        this.handleTransfer = this.handleTransfer.bind(this)
        this.getAccount = this.getAccount.bind(this)
        this.getSymbol = this.getSymbol.bind(this)
        this.handleWithdraw = this.handleWithdraw.bind(this)
        this.handleOptionSelect = this.handleOptionSelect.bind(this)
      }
    
      
    componentDidMount = async () => {
        try {
          await this.props.web3Connect() // Initialize Web3
          this.setState({
            web3: this.props.web3Wrapper,
            activeSymbol: 'SOLO'
          }, 
          this.getAccount,
          this.getSymbol,
          )
        } catch (error) {
            alert(
              'Failed to load web3, accounts, or contract.'
            );
            console.error(error);
        }
    };


    async getAccount() {
      if(this.props.web3Wrapper.isConnected){
        let accounts = await this.props.web3Wrapper.web3.eth.getAccounts()
        let account = accounts[0]
        console.log('get Account function ', account);
        if(account !== 'undefined'){
          this.setState({
            account: account,
          })
          return account
        }
      }
    }


    async getSymbol() {
      let acc = await this.getAccount()
      this.props.getSymbol({account: acc, contract_index: UDR_INDEX})
    }



    async handleTransfer() {
      await this.props.transferToken({
        account: this.state.account,
        contract_index: STK_INDEX,
        _from: this.state.account,
        _to: '0x7bFc572Ba5a084C9b09111C3dCB93E9E7283A215',
        _value: 10,
      })
    }


    async handleWithdraw() {
      await this.props.withdrawToken({
        account: this.state.account,
        contract_index: STK_INDEX,
        _from: this.state.account,
        _value: 1000000000,
      })
      console.log(this.props.withdraw)
      this.setState({
        withdraw: this.props.withdraw
      })
    }

    handleOptionSelect(symbol) {
      console.log('Clicked Row', symbol);
      this.setState({
        activeSymbol: symbol
      }, () => {
        console.log('State finished setting, ', this.state.activeSymbol)
      });
    }

    render() {
      if(!this.props.web3Wrapper) {
        return <div>Loading Web3, accounts, and contract...</div>
      }
      
      
      let Erc20Component = <h1>Choose a component in the chain above.</h1>
      switch(this.state.activeSymbol) {
        case 'UDR':
            Erc20Component =  <Erc20ComponentV2
                          getAccount={this.getAccount}
                        />
            break;
        case 'STK':
            Erc20Component =  <Erc20ComponentV2
                          getAccount={this.getAccount}
                        />
            break;
        case 'SOLO':
            Erc20Component =  <SoloComponentV2
                                getAccount={this.getAccount}
                              />
            break;
        default:
            Erc20Component = <h1>Default</h1>
            break; 
      }


      return (
        <Container fluid>
          <Row>
            <Col>
              {this.props.symbol}
              <Button onClick={this.handleTransfer}>Transfer</Button>
              <Button onClick={this.handleWithdraw}>Withdraw</Button>
              <ChainComponentV2 
                handleOptionSelect={this.handleOptionSelect}
                getAccount={this.getAccount}
              />
            </Col>
          </Row>
          <Row>
            <Col>
              <WalletComponentV2
                soloSymbol=''
                soloBalance=''
                getAccount={this.getAccount}
              />
            </Col>
            <Col xs={9}>
              {Erc20Component}
            </Col>
            <Col></Col>
          </Row>
        </Container>
          
      );
    }
}


const mapDispatchToProps = {
  web3Connect,
  fetchContract,
  getSymbol,
  transferToken,
  withdrawToken,
}

const mapStateToProps = state => {
  return {
    web3Wrapper: state.web3Wrapper,
    symbol: state.contract.symbol,
    accounts: (state.web3Wrapper.web3 && state.web3Wrapper.web3.eth) ? state.web3Wrapper.web3.eth.accounts : [],
    isConnected: state.web3Wrapper.isConnected,
    symbols: state.contract.symbols,
    account: state.contract.account,
    index: state.contract.index,
    
    name: state.contract.state,
    decimals: state.contract.decimals,
    totalSupply: state.contract.totalSupply,

    transfer: state.contract.transfer,
    isTransferred: state.contract.isTransferred,

    withdraw: state.contract.withdraw,
    isWithdrawn: state.contract.isWithdrawn,

    contract: state.contract.contract
  };
};

const SoloV2 = connect(mapStateToProps, mapDispatchToProps)(SoloV2Component);

export default SoloV2;