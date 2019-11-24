import React from 'react'
import { Row, Col, Form, FormGroup, FormControl, Button, Container } from 'react-bootstrap'
import BootstrapTable from 'react-bootstrap-table-next'
import Web3 from 'web3';
import getWeb3 from '../getWeb3'
import cMoat from '../artifacts/cMOAT'

class MoatComponent extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            instance: this.props.instance,
            strike_address: undefined,
            cMoat_address: this.props.cMoat_address,
            cMoatInstance: undefined,
            contracts: [],
            name: undefined,
            symbol: undefined,
            web3: this.props.web3,
            account: this.props.account,
            writes: [],
            underwrite: undefined,
            userBalance: undefined,
            exercises: [],
            exerciseAmount: undefined,
        }
        this.handleWrite = this.handleWrite.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.handleExercise = this.handleExercise.bind(this)
    }

    componentDidMount = async () => {
        try {
            const web3 = this.state.web3;
            const accounts = await web3.eth.getAccounts();
            const networkId = await web3.eth.net.getId();
            const deployedNetwork = cMoat.networks[networkId];
            const cMoatDeployedNetwork = cMoat.networks[networkId];

            if(typeof this.state.instance !== 'undefined') {
                const strike_address = await this.state.instance.methods.strike_address().call()
                const cMoat_address = await this.state.instance.methods.getcMoat(this.state.account).call()
                this.setState({strike_address: strike_address, cMoat_address: cMoat_address})
            }

            const cMoat_Instance = new web3.eth.Contract(
              cMoat.abi,
              this.state.cMoat_address,
            )
      
            this.setState({cMoatInstance: cMoat_Instance}, this.constants);
            this.addEventListener(this)
          } catch (error) {
            alert(
              'Failed to load web3, accounts, or contract.'
            );
            console.error(error);
          }
        
    }

    async constants() {
        if(typeof this.state.cMoatInstance !== 'undefined') {
          const name = await this.state.cMoatInstance.methods.name().call()
          const symbol = await this.state.cMoatInstance.methods.symbol().call()
          const bal = await this.state.cMoatInstance.methods.balanceOf(this.state.account).call()
          this.setState({name: name, symbol: symbol, userBalance: this.state.web3.utils.fromWei(bal, 'ether')})
        } 
      }


    async handleWrite(event) {
        if(typeof this.state.cMoatInstance !== 'undefined') {
            event.preventDefault();
            let result = await this.state.cMoatInstance.methods.write(
                this.state.web3.utils.toWei(this.state.underwrite))
                .send({from: this.state.account})
          }
    }

    async handleExercise(event) {
        if(typeof this.state.cMoatInstance !== 'undefined') {
            event.preventDefault();
            let result = await this.state.cMoatInstance.methods.exercise(
                this.state.web3.utils.toWei(this.state.exerciseAmount))
                .send({from: this.state.account})
          }
    }

    addEventListener(component) {
        if(typeof this.state.cMoatInstance !== 'undefined') {
            this.state.cMoatInstance.events.Write({fromBlock: 0, toBlock: 'latest'})
            .on('data', function(event) {
            console.log(event);
            const newWritesArray = component.state.writes.slice()
            newWritesArray.push(event.returnValues)
            component.setState({writes: newWritesArray})
            })
            this.state.cMoatInstance.events.Exercise({fromBlock: 0, toBlock: 'latest'})
            .on('data', function(event) {
            console.log(event);
            const newExercisesArray = component.state.exercises.slice()
            newExercisesArray.push(event.returnValues)
            component.setState({exercises: newExercisesArray})
          })
          .on('error', console.error);
        }
    }

    handleChange(event){
      switch(event.target.name) {
        case 'underwrite':
          this.setState({'underwrite': event.target.value})
          break;
        case 'exerciseAmount':
            this.setState({'exerciseAmount': event.target.value})
            break;
        default:
          break;
      }
    }

    render() {
        if(!this.state.web3) {
            return <div>Loading Web3, accounts, and contract...</div>
          }
        if(!this.state.cMoatInstance) {
            return <div>Loading Web3, accounts, and contract...</div>
          }
        const columns = [{
          dataField: 'transaction_id',
          text: '#'
        }, {
          dataField: '_from',
          text: 'User Address',
        }, {
          dataField: 'amount',
          text: 'Options Minted',
        }, {
          dataField: 'key',
          text: 'Lock Key ID',
        }];

        const exerciseColumns = [{
            dataField: 'transaction_id',
            text: '#'
          }, {
            dataField: '_from',
            text: 'User Address',
          }, {
            dataField: 'amount',
            text: 'Options Exercised/Burned',
          }, {
            dataField: 'key',
            text: 'Lock Key ID',
          }];

        return (
        <Container>
            <Col>
                <p>cMoat Address: {this.state.cMoat_address}</p>
                <p>Balance: {this.state.userBalance}</p>
                <p>{this.state.name}</p>
                <p>{this.state.symbol}</p>
                <h2>Write Function</h2>
            <Form onSubmit={this.handleWrite}>
              <FormGroup controlId="writecMoat">
                <FormControl 
                  componentclass="textarea"
                  name="underwrite"
                  value={this.state.underwrite}
                  placeholder="Enter Underwrite amount"
                  onChange={this.handleChange}
                />
                <Button type='submit'>Write Contract</Button>
              </FormGroup>
            </Form>
            <BootstrapTable
                  bootstrap4 striped hover
                  id='write_id' 
                  keyField='write_id' 
                  data={this.state.writes} 
                  columns={columns}
                />
            </Col>
            <Col>
            <Form onSubmit={this.handleExercise}>
              <FormGroup controlId="exercisecMoat">
                <FormControl 
                  componentclass="textarea"
                  name="exerciseAmount"
                  value={this.state.exerciseAmount}
                  placeholder="Enter exercise amount"
                  onChange={this.handleChange}
                />
                <Button type='submit'>Exercise Contract</Button>
              </FormGroup>
            </Form>
                <BootstrapTable
                  bootstrap4 striped hover
                  id='exercise_id' 
                  keyField='exercise_id' 
                  data={this.state.exercises} 
                  columns={exerciseColumns}
                />
            </Col>
        </Container>
        )
    }
}

export default MoatComponent