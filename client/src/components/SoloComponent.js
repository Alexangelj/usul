import React from 'react'
import { Row, Col, Form, FormGroup, FormControl, Container, Card, Dropdown, ListGroup } from 'react-bootstrap'
import BootstrapTable from 'react-bootstrap-table-next'
import Web3 from 'web3';
import getWeb3 from '../getWeb3'
import Solo from '../artifacts/Solo'
import { Button, StyledCard, StyledListGroup, StyledFormControl  } from '../theme/components'


class SoloComponent extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            soloinstance: undefined,
            udrInstance: this.props.udrInstance,
            stkInstance: this.props.stkInstance,
            solo_address: this.props.solo_address,
            udr_address: this.props.udr_address,
            stk_address: this.props.stk_address,
            contracts: [],
            name: undefined,
            symbol: undefined,
            ratio: undefined,
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
            const deployedNetwork = Solo.networks[networkId];
            const soloDeployedNetwork = Solo.networks[networkId];
            const soloInstance = new web3.eth.Contract(
                Solo.abi,
                soloDeployedNetwork && soloDeployedNetwork.address,
              )

            this.setState({soloInstance: soloInstance}, this.constants);
            this.addEventListener(this)
          } catch (error) {
            alert(
              'Failed to load web3, accounts, or contract.'
            );
            console.error(error);
          }
        
    }

    async constants() {
        if(typeof this.state.soloInstance !== 'undefined') {
          const name = await this.state.soloInstance.methods.name().call()
          const symbol = await this.state.soloInstance.methods.symbol().call()
          const bal = await this.state.soloInstance.methods.balanceOf(this.state.account).call()
          const ratio = await this.state.soloInstance.methods.ratio().call()
          const maturity_timestamp = await this.state.soloInstance.methods.maturity().call()
          
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
            ratio: ratio,
            maturity: maturity,
          })
        } 
      }


    async handleWrite(event) {
        if(typeof this.state.soloInstance !== 'undefined') {
            event.preventDefault();
            let result = await this.state.soloInstance.methods.write(
                this.state.web3.utils.toWei(this.state.underwrite))
                .send({from: this.state.account})
          }
    }

    async handleExercise(event) {
        if(typeof this.state.soloInstance !== 'undefined') {
            event.preventDefault();
            let result = await this.state.soloInstance.methods.exercise(
                this.state.web3.utils.toWei(this.state.exerciseAmount))
                .send({from: this.state.account})
          }
    }

    async handleClose(event) {
      if(typeof this.state.soloInstance !== 'undefined') {
          event.preventDefault();
          let result = await this.state.soloInstance.methods.close(
              this.state.web3.utils.toWei(this.state.closeAmount))
              .send({from: this.state.account})
        }
  }

    addEventListener(component) {
        if(typeof this.state.soloInstance !== 'undefined') {
            this.state.soloInstance.events.Write({fromBlock: 0, toBlock: 'latest'})
            .on('data', function(event) {
            console.log(event);
            const newWritesArray = component.state.writes.slice()
            newWritesArray.push(event.returnValues)
            component.setState({writes: newWritesArray})
            })
            this.state.soloInstance.events.Exercise({fromBlock: 0, toBlock: 'latest'})
            .on('data', function(event) {
            console.log(event);
            const newExercisesArray = component.state.exercises.slice()
            newExercisesArray.push(event.returnValues)
            component.setState({exercises: newExercisesArray})
            })
            .on('error', console.error);
            this.state.soloInstance.events.Close({fromBlock: 0, toBlock: 'latest'})
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
            return <div>Loading Web3, accounts, and contract... Are you connected to MetaMask?</div>
          }
        if(!this.state.soloInstance) {
            return <div>Loading Web3, accounts, and contract... Are you connected to MetaMask?</div>
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
          <div><h1>The Solo Contract</h1>
          <StyledCard>
            <Card.Body>
                <h3>Name: {this.state.name}</h3>
                <h5>Address: {this.state.solo_address}</h5>
                <StyledListGroup>
                  <ListGroup.Item>Your Balance: {this.state.userBalance} {this.state.symbol}</ListGroup.Item>
                  <ListGroup.Item>Symbol: {this.state.symbol}</ListGroup.Item>
                  <ListGroup.Item>Strike to Underlying Ratio: {this.state.ratio}</ListGroup.Item>
                  <ListGroup.Item>Maturity: {this.state.maturity}</ListGroup.Item>
                </StyledListGroup>
                <h2>Write Function</h2>
            <Form onSubmit={this.handleWrite}>
              <FormGroup controlId="writesolo">
                <StyledFormControl 
                  componentclass="textarea"
                  name="underwrite"
                  value={this.state.underwrite}
                  placeholder="Enter Underwrite amount"
                  onChange={this.handleChange}
                />
                <Button type='submit'>Write Contract</Button>
              </FormGroup>
            </Form>
            <h2>Exercise Function</h2>
            <Form onSubmit={this.handleExercise}>
              <FormGroup controlId="exercisesolo">
                <StyledFormControl 
                  componentclass="textarea"
                  name="exerciseAmount"
                  value={this.state.exerciseAmount}
                  placeholder="Enter Exercise amount"
                  onChange={this.handleChange}
                />
                <Button type='submit'>Exercise options</Button>
              </FormGroup>
            </Form> 
            <h2>Close Function</h2>
            <Form onSubmit={this.handleClose}>
              <FormGroup controlId="closesolo">
                <StyledFormControl 
                  componentclass="textarea"
                  name="closeAmount"
                  value={this.state.closeAmount}
                  placeholder="Enter Close amount"
                  onChange={this.handleChange}
                />
                <Button type='submit'>Close options</Button>
              </FormGroup>
            </Form>
            </Card.Body>
          </StyledCard>
          </div>
        )
    }
}

export default SoloComponent