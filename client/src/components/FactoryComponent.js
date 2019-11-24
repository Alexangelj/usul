import React from 'react'
import { Row, Col, Form, FormGroup, FormControl, Button, Container } from 'react-bootstrap'
import BootstrapTable from 'react-bootstrap-table-next'
import Web3 from 'web3';
import getWeb3 from '../getWeb3'
import cMoat from '../artifacts/cMOAT'
import MoatComponent from './MoatComponent'

class FactoryComponent extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            instance: this.props.instance,
            strike_address: undefined,
            cMoat_address: undefined,
            cMoatInstance: undefined,
            contracts: [],
            web3: this.props.web3,
            account: this.props.account,
        }
        this.handleCreatecMoat = this.handleCreatecMoat.bind(this)
        this.handleChange = this.handleChange.bind(this)
    }

    componentDidMount() {
        this.setState(this.constants)
        this.addEventListener(this)
    }

    async constants() {
        if(typeof this.state.instance !== 'undefined') {
          const strike_address = await this.state.instance.methods.strike_address().call()
          const cMoat_address = await this.state.instance.methods.getcMoat(this.state.account).call()
          this.setState({strike_address: strike_address, cMoat_address: cMoat_address})
        }
      }

    async handleCreatecMoat(event) {
      if(typeof this.state.instance !== 'undefined') {
        event.preventDefault();
        let result = await this.state.instance.methods.createcMoat(
            this.state.web3.utils.toWei(this.state.strike),
            this.state.web3.utils.toWei(this.state.underlying),
            this.state.maturity,
            this.state.name,
            this.state.symbol,)
            .send({from: this.state.account})
        
        this.setState(this.constants)
      }
    }

    addEventListener(component) {
        this.state.instance.events.Newcontract({fromBlock: 0, toBlock: 'latest'})
        .on('data', function(event) {
          console.log(event);
          const newContractsArray = component.state.contracts.slice()
          newContractsArray.push(event.returnValues)
          component.setState({contracts: newContractsArray})
        })
        .on('error', console.error);
      }

    handleChange(event){
      switch(event.target.name) {
        case 'strike':
          this.setState({'strike': event.target.value})
          break;
        case 'underlying':
          this.setState({'underlying': event.target.value})
          break;
        case 'maturity':
          this.setState({'maturity': event.target.value})
          break;
        case 'name':
            this.setState({'name': event.target.value})
            break;
        case 'symbol':
            this.setState({'symbol': event.target.value})
            break;
        default:
          break;
      }
    }

    render() {
        if(!this.state.web3) {
            return <div>Loading Web3, accounts, and contract...</div>
          }
        const columns = [{
            dataField: 'transaction_id',
            text: '#'
          }, {
            dataField: 'contract_addr',
            text: 'Contract Address',
          }, {
            dataField: 'strike',
            text: 'Strike Amount',
          }, {
            dataField: 'underlying',
            text: 'Underlying Amount',
          }, {
            dataField: 'maturity',
            text: 'Maturity UNIX timestamp',
          }];
        return (
        <Container>
            <h1>Instance: {this.state.strike_address}</h1>
            <Form onSubmit={this.handleCreatecMoat}>
              <FormGroup controlId="fromTransferUdr">
                <FormControl 
                  componentclass="textarea"
                  name="strike"
                  value={this.state.strike}
                  placeholder="Enter Strike Price"
                  onChange={this.handleChange}
                />
                <FormControl 
                  componentclass="textarea"
                  name="underlying"
                  value={this.state.underlying}
                  placeholder="Enter Underlying Price"
                  onChange={this.handleChange}
                />
                <FormControl 
                  componentclass="textarea"
                  name="maturity"
                  value={this.state.maturity}
                  placeholder="Enter Maturity UNIX Timestamp"
                  onChange={this.handleChange}
                />
                <FormControl
                  type="text"
                  name='name'
                  value={this.state.name}
                  placeholder='Enter Name'
                  onChange={this.handleChange}
                />
                <FormControl
                  type="text"
                  name='symbol'
                  value={this.state.symbol}
                  placeholder='Enter Symbol'
                  onChange={this.handleChange}
                />
                <Button type='submit'>Create cMoat</Button>
              </FormGroup>
            </Form>
            <Col>
                <p>cMoat Address: {this.state.cMoat_address}</p>
                <BootstrapTable
                  bootstrap4 striped hover
                  id='contract_id' 
                  keyField='contract_id' 
                  data={this.state.contracts} 
                  columns={columns}
                />
            </Col>
            <Col>
            <MoatComponent
                instance={this.state.instance}
                web3={this.state.web3}
                account={this.state.account}
                cMoat_address={this.state.cMoat_address}
            />
            </Col>
        </Container>
        )
    }
}

export default FactoryComponent