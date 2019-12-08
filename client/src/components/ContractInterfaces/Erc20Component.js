import React from 'react'
import { Row, Col, Form, FormGroup, FormControl, Container, Card } from 'react-bootstrap'
import BootstrapTable from 'react-bootstrap-table-next'
import Web3 from 'web3';
import getWeb3 from '../../getWeb3'
import Udr from '../../artifacts/UDR.json'

import { Button, StyledFormControl, StyledCard } from '../../theme/components'

class Erc20Component extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            contractInstance: this.props.contractInstance,
            account: this.props.account,
            web3: this.props.web3,
            name: undefined,
            symbol: undefined,
            decimals: undefined,
            totalSupply: undefined,
            address: undefined,
        }
        this.handleInputChange = this.handleInputChange.bind(this)
        this.handleTransferTx = this.handleTransferTx.bind(this)
        this.handleApproveTx = this.handleApproveTx.bind(this)
    }

    componentDidMount = async () => {
        try {
          this.addEventListener(this)
          this.setState(this.contractConstants)
        } catch (error) {
          alert(
            'Failed to load web3, accounts, or contract.'
          );
          console.error(error);
        }
    };

      
    handleInputChange(event) {
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

    async contractConstants() {
        if(typeof this.state.contractInstance !== 'undefined') {
            const name = await this.state.contractInstance.methods
                .name()
                .call()
            const symbol = await this.state.contractInstance.methods
                .symbol()
                .call()
            const decimals = await this.state.contractInstance.methods
                .decimals()
                .call()
            const totalSupply = await this.state.contractInstance.methods
                .totalSupply()
                .call()
            const address = await this.state.contractInstance
                ._address

            this.setState({
                name: name, 
                symbol: symbol,
                decimals: decimals,
                totalSupply: totalSupply,
                address: address,
            })
        }
    }

    async getUserTokenBalance() {
            const getBalance = await this.state.contractInstance.methods
                .balanceOf(this.state.account)
                .call()
            const tokenBalance = this.state.web3.utils.fromWei(getBalance, 'ether')
            this.setState({
                tokenBalance: tokenBalance
            })
    }
    
    async handleTransferTx(event) {
        if(typeof this.state.contractInstance !== 'undefined') {
            event.preventDefault();
            let result = await this.state.contractInstance.methods
            .transfer(
                this.state.transferTo, 
                this.state.web3.utils.toWei(this.state.transferAmount, 'ether')
                )
            .send({ from: this.state.account })
        }
    }

    async handleApproveTx(event) {
        if(typeof this.state.contractInstance !== 'undefined') {
            event.preventDefault();
            let result = await this.state.contractInstance.methods
            .approve(
                this.state.spender, 
                this.state.web3.utils.toWei(this.state.approveAmount, 'ether')
                )
            .send({ from: this.state.account })
        }
    }
    
    addEventListener(component) {
        this.state.contractInstance.events
        .Transfer({ fromBlock: 0, toBlock: 'latest' })
        .on('data', function(event) {
            console.log(event);
            const newTransactionsArray = component.state.transactions.slice()
            newTransactionsArray.push(event.returnValues)
            component.setState({ transactions: newTransactionsArray })
        })
        .on('error', console.error);
    }
    
    render() {
        if(!this.state.web3) {
          return <div>Loading Web3, accounts, and contract...</div>
        }

        const columns = [{
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
            <>
            <h1 className='text-center'>{this.state.symbol}: {this.state.name}</h1>
            <Row>
                <Col> 
                    <StyledCard>
                        <Card.Body>
                            <h2>Transfer Function</h2>
                            <Form onSubmit={this.handleTransferTx}>
                                <FormGroup controlId="fromTransferUdr">
                                    <StyledFormControl 
                                      componentclass="textarea"
                                      name="transferTo"
                                      value={this.state.transferTo}
                                      placeholder="Enter Transfer 'to' address"
                                      onChange={this.handleInputChange}
                                    />
                                    <br/>
                                    <StyledFormControl
                                      type="text"
                                      name='transferAmount'
                                      value={this.state.transferAmount}
                                      placeholder='Enter Transfer amount'
                                      onChange={this.handleInputChange}
                                    />
                                    <Button type='submit'>Transfer</Button>
                                </FormGroup>
                            </Form>
                            <p>Address: {this.state.address}</p>
                        </Card.Body>
                    </StyledCard>
                </Col>

                <Col>
                    <StyledCard>
                        <Card.Body>
                            <h2>Approve Function</h2>
                            <Form onSubmit={this.handleApproveTx}>
                                <FormGroup controlId="approveUdr">
                                    <StyledFormControl 
                                      componentclass="textarea"
                                      name="spender"
                                      value={this.state.spender}
                                      placeholder="Enter Approve 'spender' address"
                                      onChange={this.handleInputChange}
                                    />
                                    <br/> 
                                    <StyledFormControl
                                      type="text"
                                      name='approveAmount'
                                      value={this.state.approveAmount}
                                      placeholder='Enter Approve amount'
                                      onChange={this.handleInputChange}
                                    />
                                    <Button type='submit'>Approve</Button>
                                </FormGroup>
                            </Form>
                            <p>Address: {this.state.address}</p>
                        </Card.Body>
                    </StyledCard>
                </Col>
            </Row>
            <Row>
                <Col>
                    <h2>Transfers</h2>
                      <BootstrapTable
                        bootstrap4 striped hover condensed
                        id='_from' 
                        keyField='_from' 
                        data={this.state.transactions} 
                        columns={columns}
                      />
                </Col>
            </Row>
            </>
        )
    }
}

export default Erc20Component