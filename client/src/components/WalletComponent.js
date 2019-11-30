import React from 'react'
import { Nav, Navbar, ButtonToolbar } from 'react-bootstrap'
import { Button, StyledTable } from '../theme/components'


class WalletComponent extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
          soloSymbol: this.props.soloSymbol,
          soloBalance: this.props.soloBalance
        }
      }


    render() {
        return (
            <div>
            <h1>Wallet Balance</h1>
                  <StyledTable striped>
                    <thead>
                      <tr>
                        <th>Asset</th>
                        <th>Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{this.props.soloSymbol}</td>
                        <td>{this.props.soloBalance}</td>
                      </tr>
                      <tr>
                        <td>{this.props.udrSymbol}</td>
                        <td>{this.props.udrBalance}</td>
                      </tr>
                      <tr>
                        <td>{this.props.stkSymbol}</td>
                        <td>{this.props.stkBalance}</td>
                      </tr>
                    </tbody>
                  </StyledTable>
                    <ButtonToolbar>
                        <Button onClick={this.props.handleApproveStk}>Unlock Strike Asset</Button>
                        <Button onClick={this.props.handleApproveUdr}>Unlock Underlying Asset</Button>
                    </ButtonToolbar>
                    </div>
        )
    }
}

export default WalletComponent