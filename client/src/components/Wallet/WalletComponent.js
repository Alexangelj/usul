import React from 'react'
import { Nav, Navbar, ButtonToolbar, Form, FormGroup, FormControl } from 'react-bootstrap'
import { Button, StyledTable, StyledFormControl } from '../../theme/components'
import ToggleButton from 'react-toggle-button'
import styled from 'styled-components'

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


class WalletComponent extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
          soloSymbol: this.props.soloSymbol,
          soloBalance: this.props.soloBalance,
        }
      }


    render() {
      const { handleApproveStk, handleApproveUdr, handleLock,  handleWithdrawStk, handleWithdrawUdr } = this.props;
        return (
            <div>
            <h1 className='text-center'>Wallet Balance</h1>
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
                        <td>{this.props.soloSymbol}</td>
                        <td>{Math.floor(this.props.soloBalance * 100) / 100}</td>
                      </tr>
                      <tr>
                        <td>{this.props.udrSymbol}</td>
                        <td>{Math.floor(this.props.udrBalance * 100) / 100}</td>
                        <td><StyledToggleButton
                        inactiveLabel={'O'}
                        activeLabel={'|'} 
                        onToggle={handleApproveUdr}
                        value={this.props.udrUnlocked || false}
                      /></td>
                        <td><StyledButton onClick={handleWithdrawUdr}>Withdraw</StyledButton></td>
                      </tr>
                      <tr>
                        <td>{this.props.stkSymbol}</td>
                        <td>{Math.floor(this.props.stkBalance * 100) / 100}</td>
                        <td><StyledToggleButton
                        inactiveLabel={'O'}
                        activeLabel={'|'} 
                        onToggle={handleApproveStk}
                        value={this.props.stkUnlocked || false}
                      /></td>
                        <td><StyledButton onClick={handleWithdrawStk}>Withdraw</StyledButton></td>
                      </tr>
                    </tbody>
                  </StyledTable>
                    </div>
        )
    }
}

export default WalletComponent