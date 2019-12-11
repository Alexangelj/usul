import React from 'react'
import { Row, Col, Form, FormGroup, FormControl, Container, Card } from 'react-bootstrap'
import BootstrapTable from 'react-bootstrap-table-next'
import Web3 from 'web3';
import getWeb3 from '../../utils/getWeb3'
import Udr from '../../artifacts/UDR.json'
import { connect } from 'react-redux'

import { Button, StyledFormControl, StyledCard } from '../../theme/components'
import { STK_INDEX, UDR_INDEX, SOLO_INDEX } from '../Pages/Solo/SoloV2';

import { web3Connect } from '../../reducers/web3Reducer'
import {
  fetchContract, 
  getSymbol, 
  transferToken,
  approveToken, 
} from '../../actions/contractActions'


class Erc20Component extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
          _to: undefined,
          transferAmount: undefined,
          transactions: [],
          account: this.props.account,
          instanceAddress: undefined,
          balanceOf: undefined,
          address: undefined,
          name: undefined,
          symbol: undefined,
          spender: undefined,
          approveAmount: undefined,
          contract_index: undefined,
          txSymbol: undefined,
          getAccount: this.props.getAccount,
        }
        this.handleTransfer = this.handleTransfer.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.handleApprove = this.handleApprove.bind(this)
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
          //this.addEventListener(this)
        } catch (error) {
          alert(
            'Failed to load web3, accounts, or contract.'
          );
          console.error(error);
        }
      };

      
      handleChange(event){
        switch(event.target.name) {
          case 'txSymbol':
            switch(event.target.value) {
              case 'STK':
                this.setState({contract_index: STK_INDEX})
                break;
              case 'UDR':
                this.setState({contract_index: UDR_INDEX})
                break;
              case 'SOLO':
                this.setState({contract_index: SOLO_INDEX})
                break;
            }
            break;
          case '_to':
            this.setState({'_to': event.target.value})
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
        //if(typeof this.state.instance !== 'undefined') {
        //  const decimals = await this.state.instance.methods.decimals().call()
        //  const balance = await this.state.instance.methods.balanceOf(this.state.account).call()
        //  const name = await this.state.instance.methods.name().call()
        //  const symbol = await this.state.instance.methods.symbol().call()
        //  const instanceAddress = await this.state.instance._address
        //  var user_balance = this.state.web3.utils.fromWei(balance, 'ether')
        //  this.setState({balanceOf: user_balance, name: name, symbol: symbol, instanceAddress: instanceAddress})
        //}
      }


      async handleTransfer(event) {
        event.preventDefault();
        await this.props.transferToken({
          account: this.state.account,
          contract_index: this.state.contract_index,
          _from: this.state.account,
          _to: this.state._to,
          _value: this.props.web3Wrapper.web3.utils.toWei((this.state.transferAmount).toString(), 'ether') ,
        })
      }

      async handleApprove(event) {
        event.preventDefault();
        await this.props.approveToken({
          account: this.state.account,
          contract_index: this.state.contract_index,
          _from: this.state.account,
          _to: this.state._to,
          _value: this.state.approveAmount,
        })
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
        if(!this.props.web3Wrapper) {
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
          <Row>
          <Col> 
          <StyledCard>
            <Card.Body>
                <h2>Transfer Function</h2>
                <Form onSubmit={this.handleTransfer}>
                  <FormGroup controlId="fromTransferUdr">
                    <StyledFormControl 
                      componentclass="textarea"
                      name="txSymbol"
                      value={this.state.txSymbol}
                      placeholder="Enter Token"
                      onChange={this.handleChange}
                    />
                    <br/>
                    <StyledFormControl 
                      componentclass="textarea"
                      name="_to"
                      value={this.state._to}
                      placeholder="Enter Transfer 'to' address"
                      onChange={this.handleChange}
                    />
                    <br/>
                    <StyledFormControl
                      type="text"
                      name='transferAmount'
                      value={this.state.transferAmount}
                      placeholder='Enter Transfer amount'
                      onChange={this.handleChange}
                    />
                    <Button type='submit'>Transfer</Button>
                  </FormGroup>
                </Form>
                <p>Address: {this.state.instanceAddress}</p>
                </Card.Body>
                </StyledCard>
                </Col>
                
                <Col>
                <StyledCard>
                <Card.Body>
                <h2>Approve Function</h2>
                <Form onSubmit={this.handleApprove}>
                  <FormGroup controlId="approveUdr">
                    <StyledFormControl 
                      componentclass="textarea"
                      name="txSymbol"
                      value={this.state.txSymbol}
                      placeholder="Enter Token"
                      onChange={this.handleChange}
                    />
                    <br/>
                    <StyledFormControl 
                      componentclass="textarea"
                      name="spender"
                      value={this.state.spender}
                      placeholder="Enter Approve 'spender' address"
                      onChange={this.handleChange}
                    />
                    <br/> 
                    <StyledFormControl
                      type="text"
                      name='approveAmount'
                      value={this.state.approveAmount}
                      placeholder='Enter Approve amount'
                      onChange={this.handleChange}
                    />
                    <Button type='submit'>Approve</Button>
                  </FormGroup>
                </Form>
                <p>Address: {this.state.instanceAddress}</p>
            </Card.Body>
          </StyledCard>
          </Col>
          </Row>
          <Row>
          <h2>Transfers</h2>
                <BootstrapTable
                  bootstrap4 striped hover condensed
                  id='_from' 
                  keyField='_from' 
                  data={this.state.transactions} 
                  columns={columns}
                />
          </Row>
          </>
        )
    }
}

const mapDispatchToProps = {
  fetchContract,
  approveToken,
  transferToken,
  getSymbol,
}


const mapStateToProps = state => {
  return {
      web3Wrapper: state.web3Wrapper,
      isConnected: state.web3Wrapper.isConnected,
      contract: state.contract.contract,
      symbol: state.contract.symbol,

      transfer: state.contract.transfer,
      isTransferred: state.contract.isTransferred,
      approve: state.contract.approve,
      isApproved: state.contract.isApproved,
  };
};


const Erc20ComponentV2 = connect(mapStateToProps, mapDispatchToProps)(Erc20Component);


export default Erc20ComponentV2