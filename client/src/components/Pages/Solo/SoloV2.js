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

import { drizzleConnect, DrizzleContext } from 'drizzle-react';

import { connect } from 'react-redux'
import { web3Connect } from '../../../reducers/web3Reducer'
import { stkConnect } from '../../../reducers/contractReducer'
import { getSymbol } from '../../../reducers/contractReducer'

class SoloV2Component extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            web3: undefined,
            accounts: this.props.accounts,
            solo: this.props.solo,
            udr: this.props.udr,
            stk: this.props.stk,

        }

      }
    
      
    componentDidMount = async () => {
        try {
          this.props.web3Connect() // Initialize Web3

          this.setState({
            web3: this.props.web3Wrapper,
          })

          this.props.getSymbol({account: this.props.accounts[0]})
        } catch (error) {
            alert(
              'Failed to load web3, accounts, or contract.'
            );
            console.error(error);
        }
    };


    createListItems = async () => {
      return this.props.context.map((context) => {
          return (
              <>
              <div>
                Hi
              </div>
              </>
            );
        })
    }


    render() {
      if(!this.props.web3Wrapper) {
        return <div>Loading Web3, accounts, and contract...</div>
      }


      return (
          <div className='text-center'>{this.props.symbol}</div>
      );
    }
}


const mapDispatchToProps = {
  web3Connect,
  getSymbol
}

const mapStateToProps = state => {
  return {
    context: state.context,
    web3Wrapper: state.web3Wrapper,
    symbol: state.contract.result,
    accounts: (state.web3Wrapper.web3 && state.web3Wrapper.web3.eth) ? state.web3Wrapper.web3.eth.accounts : [],
    isConnected: state.web3Wrapper.isConnected,
  };
};

const SoloV2 = connect(mapStateToProps, mapDispatchToProps)(SoloV2Component);

export default SoloV2;