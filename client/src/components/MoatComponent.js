import React from 'react'
import { Row, Col, Form, FormGroup, FormControl, Button, Container, Card, Dropdown, ListGroup } from 'react-bootstrap'
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
            strike: undefined,
            underlying: undefined,
            maturity: undefined,
            web3: this.props.web3,
            account: this.props.account,
            writes: [],
            underwrite: undefined,
            userBalance: undefined,
            exercises: [],
            exerciseAmount: undefined,
            closes: [],
            closeAmount: undefined,
        }
        this.handleWrite = this.handleWrite.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.handleExercise = this.handleExercise.bind(this)
        this.handleClose = this.handleClose.bind(this)
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
          const strike = await this.state.cMoatInstance.methods.strike().call()
          const underlying = await this.state.cMoatInstance.methods.underlying().call()
          const maturity_timestamp = await this.state.cMoatInstance.methods.maturity().call()
          var date = new Date(maturity_timestamp*1000);
          var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
          var year = date.getFullYear();
          var month = months[date.getMonth()];
          var day = date.getDate();
          var hours = date.getHours();
          var minutes = '0' + date.getMinutes();
          var seconds = '0' + date.getSeconds();
          var maturity = day + ' ' + month + ' ' + year + ' ' + hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
          this.setState({name: name, 
            symbol: symbol, 
            userBalance: this.state.web3.utils.fromWei(bal, 'ether'),
            strike: this.state.web3.utils.fromWei(strike, 'ether'),
            underlying: this.state.web3.utils.fromWei(underlying, 'ether'),
            maturity: maturity,
          })
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

    async handleClose(event) {
      if(typeof this.state.cMoatInstance !== 'undefined') {
          event.preventDefault();
          let result = await this.state.cMoatInstance.methods.close(
              this.state.web3.utils.toWei(this.state.closeAmount))
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
            this.state.cMoatInstance.events.Close({fromBlock: 0, toBlock: 'latest'})
            .on('data', function(event) {
            console.log(event);
            const newClosesArray = component.state.closes.slice()
            newClosesArray.push(event.returnValues)
            component.setState({closes: newClosesArray})
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
        case 'closeAmount':
            this.setState({'closeAmount': event.target.value})
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
            dataField: '_from',
            text: 'User Address',
          }, {
            dataField: 'amount',
            text: 'Options Exercised/Burned',
          }, {
            dataField: 'key',
            text: 'Lock Key ID',
          }];
        const closeColumns = [{
          dataField: '_from',
          text: 'User Address',
        }, {
          dataField: 'amount',
          text: 'Options Closed/Burned',
        }, {
          dataField: 'key',
          text: 'Lock Key ID',
        }];

        return (
          <Container>
          <Card>
            <Card.Body>
                <h1>cMoat Address: {this.state.cMoat_address}</h1>
                <h3>Name: {this.state.name}</h3>
                <ListGroup as='ul'>
                  <ListGroup.Item as='li'>Balance: {this.state.userBalance} {this.state.symbol}</ListGroup.Item>
                  <ListGroup.Item as='li'>Symbol: {this.state.symbol}</ListGroup.Item>
                  <ListGroup.Item as='li'>Strike: {this.state.strike}</ListGroup.Item>
                  <ListGroup.Item as='li'>Underlying: {this.state.underlying}</ListGroup.Item>
                  <ListGroup.Item as='li'>Maturity: {this.state.maturity}</ListGroup.Item>
                </ListGroup>
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
                  bootstrap4 striped hover condensed
                  id='key' 
                  keyField='key' 
                  data={this.state.writes} 
                  columns={columns}
                />
            <h2>Exercise Function</h2>
            <Form onSubmit={this.handleExercise}>
              <FormGroup controlId="exercisecMoat">
                <FormControl 
                  componentclass="textarea"
                  name="exerciseAmount"
                  value={this.state.exerciseAmount}
                  placeholder="Enter Exercise amount"
                  onChange={this.handleChange}
                />
                <Button type='submit'>Exercise options</Button>
              </FormGroup>
            </Form>
                <BootstrapTable
                  bootstrap4 striped hover condensed
                  id='key' 
                  keyField='key' 
                  data={this.state.exercises} 
                  columns={exerciseColumns}
                />
            <h2>Close Function</h2>
            <Form onSubmit={this.handleClose}>
              <FormGroup controlId="closecMoat">
                <FormControl 
                  componentclass="textarea"
                  name="closeAmount"
                  value={this.state.closeAmount}
                  placeholder="Enter Close amount"
                  onChange={this.handleChange}
                />
                <Button type='submit'>Close options</Button>
              </FormGroup>
            </Form>
                <BootstrapTable
                  bootstrap4 striped hover condensed
                  id='key' 
                  keyField='key' 
                  data={this.state.closes} 
                  columns={closeColumns}
                />
            </Card.Body>
          </Card>
          </Container>

        )
    }
}

export default MoatComponent