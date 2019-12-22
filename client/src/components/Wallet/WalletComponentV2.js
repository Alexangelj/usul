import React from 'react'
import { Nav, Navbar, ButtonToolbar, Form, FormGroup, FormControl } from 'react-bootstrap'
import { Button, StyledTable, StyledFormControl } from '../../theme/components'
import ToggleButton from 'react-toggle-button'
import styled from 'styled-components'


import { connect } from 'react-redux'
import { STK_INDEX, UDR_INDEX, SOLO_INDEX } from '../Pages/Solo/SoloV2';

import { web3Connect } from '../../reducers/web3Reducer'
import {
  fetchContract, 
  getSymbol,
  getBalance, 
  transferToken,
  approveToken,
  withdrawToken, 
} from '../../actions/contractActions'


export const StyledButton = styled(Button)`
    padding: 0.5rem 1rem 0.5rem 1rem;
    border-radius: 0.75rem;
    cursor: pointer;
    user-select: none;
    font-size: 1rem;
    border: none;
    outline: none;
    width: 100%;
    color: black;
    background: #E1E1E1;
    margin-top: 1px;
    margin-bottom: 1px;
    justify-content: center;
  `

export const StyledToggleButton = styled(ToggleButton)`
    justify-content: center;
  `

// FIX
class WalletComponent extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
          soloSymbol: this.props.soloSymbol,
          soloBalance: this.props.soloBalance,
          account: this.props.account,
          getAccount: this.props.getAccount,
        }
        this.handleWithdraw = this.handleWithdraw.bind(this);
        this.handleApprove = this.handleApprove.bind(this);
      }


    componentDidMount = async () => {
      try {
          let account = await this.props.getAccount();
          this.setState({
              web3: this.props.web3Wrapper.web3,
              account: account,
          },
              this.constants
          )
        } catch (error) {
          alert(
            'Failed to load web3, accounts, or contract.'
          );
          console.error(error);
        }
        
    }

    async constants() {
      await this.getSymbols();
      await this.getBalances();
      //await this.props.getRatio({contract_index: SOLO_INDEX})
      //.then(() => {
      //    console.log('get ratio ', this.props.ratio)
      //    this.setState({
      //        ratio: this.props.ratio
      //    });
      //})
      //await this.getMaturity();
      //await this.props.getAddress({contract_index: SOLO_INDEX})
      //.then(() => {
      //    console.log('get address ', this.props.address)
      //    this.setState({
      //        address: this.props.address
      //    });
      //})
    }

    async getSymbols() {
      await this.props.getSymbol({contract_index: SOLO_INDEX})
      .then(() => {
          this.setState({
              soloSymbol: this.props.symbol
          })
      })
      await this.props.getSymbol({contract_index: STK_INDEX})
      .then(() => {
          this.setState({
              stkSymbol: this.props.symbol
          })
      })
      await this.props.getSymbol({contract_index: UDR_INDEX})
      .then(() => {
          this.setState({
              udrSymbol: this.props.symbol
          })
      })
    }


    async getBalances() {
      await this.props.getBalance({
        account: this.state.account, 
        contract_index: SOLO_INDEX
      })
      .then(() => {
          this.setState({
              soloBalance: this.props.balance
          })
      })
      await this.props.getBalance({
        account: this.state.account,
        contract_index: STK_INDEX
      })
      .then(() => {
          this.setState({
              stkBalance: this.props.balance
          })
      })
      await this.props.getBalance({
        account: this.state.account,
        contract_index: UDR_INDEX
      })
      .then(() => {
          this.setState({
              udrBalance: this.props.balance
          })
      })
    }

    async handleWithdraw() {
       console.log('account ', this.state.account)
      await this.props.withdrawToken({
        account: this.state.account,
        contract_index: UDR_INDEX,
        _from: this.state.account,
        _value: 100,
      })
      console.log(this.props.withdraw)
      this.setState({
        withdraw: this.props.withdraw
      })
    }

    async handleApprove() {
       console.log('account ', this.state.account)
      await this.props.withdrawToken({
        account: this.state.account,
        contract_index: UDR_INDEX,
        _from: this.state.account,
        _value: 100,
      })
      console.log(this.props.withdraw)
      this.setState({
        withdraw: this.props.withdraw
      })
    }


    render() {
      if(!this.props.web3Wrapper) {
        return <div>Loading Web3, accounts, and contract...</div>
      }
      //
        return (
            <div>
            <h1 className='text-center'>Wallet Balance</h1>
            <h5 className='text-center'>Account: {this.state.account}</h5>
                  <StyledTable>
                    <thead>
                      <tr>
                        <th>Asset</th>
                        <th>Balance</th>
                        <th>Unlock</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{this.state.soloSymbol}</td>
                        <td>{Math.floor(this.state.soloBalance * 100) / 100}</td>
                      </tr>
                      <tr>
                        <td>{this.state.udrSymbol}</td>
                        <td>{Math.floor(this.state.udrBalance * 100) / 100}</td>
                        <td><StyledToggleButton
                        inactiveLabel={'O'}
                        activeLabel={'|'} 
                        onToggle={this.handleApprove}
                        value={this.state.udrUnlocked || false}
                      /></td>
                        <td><StyledButton onClick={this.handleWithdraw}>Withdraw</StyledButton></td>
                      </tr>
                      <tr>
                        <td>{this.state.stkSymbol}</td>
                        <td>{Math.floor(this.state.stkBalance * 100) / 100}</td>
                        <td><StyledToggleButton
                        inactiveLabel={'O'}
                        activeLabel={'|'} 
                        onToggle={this.handleApprove}
                        value={this.state.stkUnlocked || false}
                      /></td>
                        <td><StyledButton onClick={this.handleWithdraw}>Withdraw</StyledButton></td>
                      </tr>
                    </tbody>
                  </StyledTable>
                    </div>
        )
    }
}

const mapDispatchToProps = {
  fetchContract,
  approveToken,
  transferToken,
  withdrawToken,
  getSymbol,
  getBalance,
}


const mapStateToProps = state => {
  return {
      web3Wrapper: state.web3Wrapper,
      isConnected: state.web3Wrapper.isConnected,
      contract: state.contract.contract,
      symbol: state.contract.symbol,
      balance: state.contract.balance,

      transfer: state.contract.transfer,
      isTransferred: state.contract.isTransferred,
      approve: state.contract.approve,
      isApproved: state.contract.isApproved,
  };
};


const WalletComponentV2 = connect(mapStateToProps, mapDispatchToProps)(WalletComponent);


export default WalletComponentV2