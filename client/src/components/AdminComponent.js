import React from 'react'
import { Row, Col, Form, FormGroup, FormControl, Container, Card } from 'react-bootstrap'
import BootstrapTable from 'react-bootstrap-table-next'
import Web3 from 'web3';
import getWeb3 from '../getWeb3'
import Udr from '../artifacts/UDR.json'
import Stk from '../artifacts/STK.json'
import Solo from '../artifacts/Solo.json'

import { Button, StyledFormControl, StyledCard } from '../theme/components'

class AdminComponent extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
          instance: undefined,
          udrInstance: undefined,
          stkInstance: undefined,
          udr_address: undefined,
          stk_address: undefined,
          solo_address: undefined,
          transferTo: undefined,
          transferAmount: undefined,
          transactions: [],
          account: undefined,
          web3: undefined,
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
        this.constants = this.constants.bind(this)
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
                instance: soloInstance,
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
            name: soloSymbol,
            symbol: soloSymbol, 
            soloBalance: this.state.web3.utils.fromWei(soloBalance, 'ether'),
            soloRatio: soloRatio,
            admin: admin,
          });
          console.log(this.state.admin, this.state.account)

          const decimals = await this.state.instance.methods.decimals().call()
          const balance = await this.state.instance.methods.balanceOf(this.state.account).call()
          const name = await this.state.instance.methods.name().call()
          const symbol = await this.state.instance.methods.symbol().call()
          const instanceAddress = await this.state.instance._address
          var user_balance = this.state.web3.utils.fromWei(balance, 'ether')
          this.setState({balanceOf: user_balance, name: name, symbol: symbol, instanceAddress: instanceAddress})

        }
        console.log('admin', this.state.admin, 'account', this.state.account)

      }

      
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

      //async constants() {
      //  if(typeof this.state.instance !== 'undefined') {
      //    const decimals = await this.state.instance.methods.decimals().call()
      //    const balance = await this.state.instance.methods.balanceOf(this.state.account).call()
      //    const name = await this.state.instance.methods.name().call()
      //    const symbol = await this.state.instance.methods.symbol().call()
      //    const instanceAddress = await this.state.instance._address
      //    var user_balance = this.state.web3.utils.fromWei(balance, 'ether')
      //    this.setState({balanceOf: user_balance, name: name, symbol: symbol, instanceAddress: instanceAddress})
      //  }
      //}
    
      async handleTransfer(event) {
        if(typeof this.state.soloInstance !== 'undefined') {
          event.preventDefault();
          let result = await this.state.soloInstance.methods.transfer(this.state.transferTo, this.state.web3.utils.toWei(this.state.transferAmount, 'ether')).send({from: this.state.account})
        }
      }

      async handleApprove(event) {
        if(typeof this.state.soloInstance !== 'undefined') {
          event.preventDefault();
          let result = await this.state.instance.methods.approve(this.state.spender, this.state.web3.utils.toWei(this.state.approveAmount, 'ether')).send({from: this.state.account})
        }
      }
    
      addEventListener(component) {
        this.state.soloInstance.events.Transfer({fromBlock: 0, toBlock: 'latest'})
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
          dataField: '_from',
          text: 'From Address',
        }, {
          dataField: '_to',
          text: 'To Address',
        }, {
          dataField: '_value',
          text: 'Value',
        }];

        if(this.state.account != this.state.admin) {
            return (
                    <h1 className='text-center'>For Admin Only </h1>
            )
        }

        return (
          <Container>
          <h1 className='text-center'>{this.state.symbol}: {this.state.name}</h1>
          <Row>
          <Col> 
          <StyledCard>
            <Card.Body>
                <h2>Transfer Function</h2>
                <Form onSubmit={this.handleTransfer}>
                  <FormGroup controlId="fromTransferUdr">
                    <StyledFormControl 
                      componentclass="textarea"
                      name="transferTo"
                      value={this.state.transferTo}
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
          </Container>
        )
    }
}

export default AdminComponent