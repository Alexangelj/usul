import React from 'react'
import { Row, Col, Form, FormGroup, FormControl, Container, Card } from 'react-bootstrap'
import BootstrapTable from 'react-bootstrap-table-next'
import Web3 from 'web3';
import getWeb3 from '../getWeb3'
import Udr from '../artifacts/UDR.json'

import { Button } from '../theme/components'

class UdrComponent extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
          instance: this.props.instance,
          transferTo: undefined,
          transferAmount: undefined,
          transactions: [],
          account: this.props.account,
          web3: this.props.web3,
          instanceAddress: undefined,
          balanceOf: undefined,
          address: undefined,
          name: undefined,
          symbol: undefined,
          spender: undefined,
          approveAmount: undefined,
        }
        this.handleTransfer = this.handleTransfer.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.handleApprove = this.handleApprove.bind(this)
      }

      componentDidMount = async () => {
        try {
          this.addEventListener(this)
          this.setState(this.constants)
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
          case 'address':
            this.setState({'address': event.target.value})
            break;
          case 'spender':
            this.setState({'spender': event.target.value})
            break;
          case 'approveAmount':
            this.setState({'approveAmount': event.target.value})
            break;
          default:
            break;
        }
      }

      async constants() {
        if(typeof this.state.instance !== 'undefined') {
          const decimals = await this.state.instance.methods.decimals().call()
          const balance = await this.state.instance.methods.balanceOf(this.state.account).call()
          const name = await this.state.instance.methods.name().call()
          const symbol = await this.state.instance.methods.symbol().call()
          const instanceAddress = await this.state.instance._address
          var user_balance = this.state.web3.utils.fromWei(balance, 'ether')
          this.setState({balanceOf: user_balance, name: name, symbol: symbol, instanceAddress: instanceAddress})
        }
      }
    
      async handleTransfer(event) {
        if(typeof this.state.instance !== 'undefined') {
          event.preventDefault();
          let result = await this.state.instance.methods.transfer(this.state.transferTo, this.state.web3.utils.toWei(this.state.transferAmount, 'ether')).send({from: this.state.account})
        }
      }

      async handleApprove(event) {
        if(typeof this.state.instance !== 'undefined') {
          event.preventDefault();
          let result = await this.state.instance.methods.approve(this.state.spender, this.state.web3.utils.toWei(this.state.approveAmount, 'ether')).send({from: this.state.account})
        }
      }
    
      addEventListener(component) {
        this.state.instance.events.Transfer({fromBlock: 0, toBlock: 'latest'})
        .on('data', function(event) {
          console.log(event);
          const newTransactionsArray = component.state.transactions.slice()
          newTransactionsArray.push(event.returnValues)
          component.setState({transactions: newTransactionsArray})
        })
        .on('error', console.error);
      }
    
      render() {
        if(!this.state.web3) {
          return <div>Loading Web3, accounts, and contract...</div>
        }
        const columns = [{
          dataField: 'transaction_id',
          text: '#'
        }, {
          dataField: '_from',
          text: 'From Address',
        }, {
          dataField: '_to',
          text: 'To Address',
        }, {
          dataField: '_value',
          text: 'Value',
        }];

        return (

          <Card>
            <Card.Body>

                <h1>{this.state.name}: {this.state.symbol}</h1>
                <p>Address: {this.state.instanceAddress}</p>
                <p>Wallet Balance: {this.state.balanceOf} {this.state.symbol} </p>
                <h2>Transfer Function</h2>
                <Form onSubmit={this.handleTransfer}>
                  <FormGroup controlId="fromTransferUdr">
                    <FormControl 
                      componentclass="textarea"
                      name="transferTo"
                      value={this.state.transferTo}
                      placeholder="Enter Transfer 'to' address"
                      onChange={this.handleChange}
                    />
                    <FormControl
                      type="text"
                      name='transferAmount'
                      value={this.state.transferAmount}
                      placeholder='Enter transfer amount'
                      onChange={this.handleChange}
                    />
                    <Button type='submit'>Transfer</Button>
                  </FormGroup>
                </Form>
                <h2>Approve Function</h2>
                <Form onSubmit={this.handleApprove}>
                  <FormGroup controlId="approveUdr">
                    <FormControl 
                      componentclass="textarea"
                      name="spender"
                      value={this.state.spender}
                      placeholder="Enter Approve 'spender' address"
                      onChange={this.handleChange}
                    />
                    <FormControl
                      type="text"
                      name='approveAmount'
                      value={this.state.approveAmount}
                      placeholder='Enter Approve amount'
                      onChange={this.handleChange}
                    />
                    <Button type='submit'>Approve</Button>
                  </FormGroup>
                </Form>
                <h2>Transfers</h2>
                <BootstrapTable
                  bootstrap4 striped hover condensed
                  id='transaction_id' 
                  keyField='transaction_id' 
                  data={this.state.transactions} 
                  columns={columns}
                />

            </Card.Body>
          </Card>

        )
    }
}

export default UdrComponent