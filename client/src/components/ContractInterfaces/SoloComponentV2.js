import React from 'react'
import { Row, Col, Form, FormGroup, FormControl, Container, Card, Dropdown, ListGroup, Tab, Tabs, Nav, Modal, ButtonToolbar } from 'react-bootstrap'
import BootstrapTable from 'react-bootstrap-table-next'
import Web3 from 'web3';
import getWeb3 from '../../utils/getWeb3'
import Solo from '../../artifacts/Solo'
import { Button, StyledCard, StyledListGroup, StyledFormControl, StyledTable  } from '../../theme/components'
import styled from 'styled-components'


import { connect } from 'react-redux'
import { web3Connect } from '../../reducers/web3Reducer'
import { 
    fetchContract, 
    getSymbol,
    getRatio,
    getMaturity,
    getAddress,
    buyToken,
    writeToken,
    closeToken,
    exerciseToken,
} from '../../actions/contractActions'
import { 
    STK_INDEX,
    UDR_INDEX,
    SOLO_INDEX
} from '../Pages/Solo/SoloV2'


const white = '#FFFFFF'
const black = '#000000'
const concrete = '#292C2F'
const grey = '#E1E1E1'
const darkGrey = '#202124'
export const StyledButton = styled(Button)`
    justify-content: center;
  `

export const StyledTabs = styled(Tabs)`
    border: 1px;
    background-color: ${props => props.selected ?  concrete : concrete};
  `

export const StyledModal = styled(Modal)`
    border: 1px;
    background-color: ${props => props.selected ?  black : black};
    min-width: 50%;
    animation: false;

    &.mainModal {
      background: transparent;
    }
  `

export const StyledTab = styled(Tab).attrs({
  selectedClassName: 'selected',
  disabledClassName: 'disabled',
})`
    flex-grow: 1;
    text-align: center;
    padding: 12px 0;
    list-style: none;
    cursor: pointer;
    color: white;
    border-left: 1px solid #e0e0e0;
    border-bottom: 1px solid #e0e0e0;

    &:first-child {
      border-left: none;
    }

    &.selected {
      color: ${props => props.selected ?  white : white};
      border-bottom: none;
    }

    &.disabled {
      color: #e0e0e0;
      cursor: not-allowed;
    }
  `

StyledTabs.tabsRole = 'Tabs';
StyledTab.tabRole = 'Tab';

function MyVerticallyCenteredModal(props) {
  return (
    <StyledModal
      {...props}
      size="lg"
      centered
      animation={false}
      className='mainModal'
    >
      <Modal.Header closeButton>
        <Modal.Title id={props.name}>
        {props.name}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h4><strong>SOLO</strong></h4>
            <Form onSubmit={props.action}>
              <FormGroup controlId="writesolo">
                <StyledFormControl 
                  componentclass="textarea"
                  name="underwrite"
                  value={props.underwrite}
                  placeholder="Enter Underwrite amount"
                  onChange={props.handleChange}
                />
                <p>
                  This will cost: {props.underwrite} UDR tokens.
                </p>
                <StyledButton type='submit'>{props.name} options</StyledButton>
              </FormGroup>
            </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide}>Close</Button>
      </Modal.Footer>
    </StyledModal>
  );
}

function Modal2(props) {
  const [modalShow, setModalShow] = React.useState(false);
  

  return (
            <ButtonToolbar>
              <Button variant="primary" onClick={() => setModalShow(true)}>
                Action
              </Button>

              <MyVerticallyCenteredModal
                show={modalShow}
                onHide={() => setModalShow(false)}
                action={props.action}
                handleChange={props.handleChange}
                value={props.underwite}
                name={props.name}
              />
            </ButtonToolbar>
  )
}


class SoloComponent extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            soloinstance: undefined,
            contracts: [],
            name: undefined,
            symbol: undefined,
            ratio: undefined,
            maturity: undefined,
            writes: [],
            underwrite: undefined,
            userBalance: undefined,
            exercises: [],
            exerciseAmount: undefined,
            closes: [],
            closeAmount: undefined,
            fee: 0.000025,
            purchaseSolo: undefined,
            ethPrice: undefined,
            availableSolo: undefined,
            account: this.props.account,
            getAccount: this.props.getAccount,
        }
        this.handleBuy = this.handleBuy.bind(this)
        this.handleWrite = this.handleWrite.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.handleExercise = this.handleExercise.bind(this)
        this.handleClose = this.handleClose.bind(this)
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
            this.addEventListener(this)
          } catch (error) {
            alert(
              'Failed to load web3, accounts, or contract.'
            );
            console.error(error);
          }
        
    }


    async getSymbols() {
      await this.props.getSymbol({contract_index: SOLO_INDEX})
      .then(() => {
          this.setState({
              soloSymbol: this.props.symbol
          })
      })
      await this.props.getSymbol({contract_index: STK_INDEX})
      .then(() => {
          this.setState({
              stkSymbol: this.props.symbol
          })
      })
      await this.props.getSymbol({contract_index: UDR_INDEX})
      .then(() => {
          this.setState({
              udrSymbol: this.props.symbol
          })
      })
    }


    async constants() {
        if(typeof this.state.soloInstance !== 'undefined') {
          //const name = await this.state.soloInstance.methods.name().call()
          //const symbol = await this.state.soloInstance.methods.symbol().call()
          //const bal = await this.state.soloInstance.methods.balanceOf(this.state.account).call()
          //const ratio = await this.state.soloInstance.methods.ratio().call()
          //const maturity_timestamp = await this.state.soloInstance.methods.maturity().call()
          //let ethPrice = await this.state.soloInstance.methods.ethPrice().call()
          //let availableSolo = await this.state.soloInstance.methods.balanceOf(this.state.solo_address).call()
          //
          //
          //var date = new Date(maturity_timestamp*1000);
          //var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
          //var year = date.getFullYear();
          //var month = months[date.getMonth()];
          //var day = date.getDate();
          //var hours = date.getHours();
          //var minutes = '0' + date.getMinutes();
          //var seconds = '0' + date.getSeconds();
          //var maturity = day + ' ' + month + ' ' + year + ' ' + hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
          //
          //this.setState({name: name, 
          //  symbol: symbol, 
          //  userBalance: this.state.web3.utils.fromWei(bal, 'ether'),
          //  ratio: ratio,
          //  maturity: maturity,
          //  ethPrice: this.state.web3.utils.fromWei(ethPrice, 'ether'),
          //  availableSolo: this.state.web3.utils.fromWei(availableSolo, 'ether'),
          //})
        } 
      }


    async handleBuy(event) {
      if(typeof this.props.web3Wrapper !== 'undefined') {
          event.preventDefault();
          
          let value = this.props.web3Wrapper.web3.utils.toWei((this.state.purchaseSolo).toString());
          await this.props.buyToken({
            account: this.state.account,
            contract_index: SOLO_INDEX,
            _from: this.state.account,
            _value: value,
          })
        }
    }

    async handleWrite(event) {
      if(typeof this.props.web3Wrapper !== 'undefined') {
          event.preventDefault();
          
          let value = this.props.web3Wrapper.web3.utils.toWei((this.state.underwrite).toString());
          await this.props.writeToken({
            account: this.state.account,
            contract_index: SOLO_INDEX,
            _from: this.state.account,
            _value: value,
          })
        }
    }


    async handleExercise(event) {
      if(typeof this.props.web3Wrapper !== 'undefined') {
          event.preventDefault();
          
          let value = this.props.web3Wrapper.web3.utils.toWei((this.state.exerciseAmount).toString());
          await this.props.exerciseToken({
            account: this.state.account,
            contract_index: SOLO_INDEX,
            _from: this.state.account,
            _value: value,
          })
        }
    }

    async handleClose(event) {
      if(typeof this.props.web3Wrapper !== 'undefined') {
          event.preventDefault();
          
          let value = this.props.web3Wrapper.web3.utils.toWei((this.state.closeAmount).toString());
          await this.props.closeToken({
            account: this.state.account,
            contract_index: SOLO_INDEX,
            _from: this.state.account,
            _value: value,
          })
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
        case 'purchaseSolo':
            this.setState({'purchaseSolo': event.target.value})
            break;
        default:
          break;
      }
    }

    render() {
        if(!this.props.web3Wrapper) {
            return <div>Loading Web3, accounts, and contract... Are you connected to MetaMask?</div>
          }

        return (
          <>
            <h1 className='text-center'>The {this.state.name} Contract</h1>
            <Row>
            <Col>
              <StyledCard>
              <h3>Buy <strong>SOLO</strong></h3>
              <Form onSubmit={this.handleBuy}>
                <FormGroup controlId="Buysolo">
                  <StyledFormControl 
                    componentclass="textarea"
                    name="purchaseSolo"
                    value={this.state.purchaseSolo}
                    placeholder="Enter purchase amount"
                    onChange={this.handleChange}
                  />
                  <br/>
                  <p> Available: {(Math.floor((this.state.availableSolo - this.state.purchaseSolo) * 100) / 100) || (Math.floor((this.state.availableSolo) * 100) / 100)} Solo <br/>
                      Price: {Math.floor((this.state.purchaseSolo * this.state.ethPrice) * 100) / 100 || Math.floor((this.state.ethPrice) * 100) / 100} Ether <br/>
                      Total: {Math.floor((this.state.purchaseSolo) * 100) / 100} SOLO Tokens. 
                  </p>
                  <StyledButton type='submit'>Buy options</StyledButton>
                </FormGroup>
              </Form>
              <h3>Write <strong>SOLO</strong></h3>
              <Form onSubmit={this.handleWrite}>
                <FormGroup controlId="writesolo">
                  <StyledFormControl 
                    componentclass="textarea"
                    name="underwrite"
                    value={this.state.underwrite}
                    placeholder="Enter Underwrite amount"
                    onChange={this.handleChange}
                  />
                  <br/>
                  <p> Lock: {this.state.underwrite} UDR Tokens <br/>
                      Mint: {Math.floor((this.state.underwrite) * 100) / 100} SOLO Tokens
                  </p>
                  <StyledButton type='submit'>Write options</StyledButton>
                </FormGroup>
              </Form>
              <p>Address: {this.state.solo_address}</p>
              </StyledCard>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         
            </Col>
            <Col>
              <StyledCard>            
              <h3>Exercise <strong>SOLO</strong></h3>
              <Form onSubmit={this.handleExercise}>
                <FormGroup controlId="exercisesolo">
                  <StyledFormControl 
                    componentclass="textarea"
                    name="exerciseAmount"
                    value={this.state.exerciseAmount}
                    placeholder="Enter Exercise amount"
                    onChange={this.handleChange}
                  />
                  <br/>
                  <p> Pay: {Math.floor((this.state.exerciseAmount * this.state.ratio) * 100) / 100} STK Tokens <br/>
                      Burn: {Math.floor(this.state.exerciseAmount * 100) / 100 } SOLO Tokens <br/>
                      Receive: {Math.floor(this.state.exerciseAmount * 100) / 100 } UDR Tokens 
                  </p>
                  <StyledButton type='submit'>Exercise options</StyledButton>
                </FormGroup>
              </Form> 
              <h3>Close <strong>SOLO</strong></h3>
              <Form onSubmit={this.handleClose}>
                <FormGroup controlId="closesolo">
                  <StyledFormControl 
                    componentclass="textarea"
                    name="closeAmount"
                    value={this.state.closeAmount}
                    placeholder="Enter Close amount"
                    onChange={this.handleChange}
                  />
                  <br/>
                  <p>
                      Burn: {Math.floor(this.state.closeAmount * 100) / 100 } SOLO Tokens <br/>
                      Receive: {Math.floor(this.state.closeAmount * 100) / 100 } UDR Tokens 
                  </p>
                  <StyledButton type='submit'>Close options</StyledButton>
                </FormGroup>
              </Form>
              <p>Address: {this.state.solo_address}</p>
              </StyledCard>
            </Col>
            </Row>
          </>
        )
    }
}



const mapDispatchToProps = {
  web3Connect,
  fetchContract,
  getSymbol,
  getRatio,
  getMaturity,
  getAddress,
  buyToken,
  writeToken,
  closeToken,
  exerciseToken,
}


const mapStateToProps = state => {
  return {
      web3Wrapper: state.web3Wrapper,
      isConnected: state.web3Wrapper.isConnected,
      contract: state.contract.contract,
      symbol: state.contract.symbol,
      ratio: state.contract.ratio,
      maturity: state.contract.maturity,
      address: state.contract.address,
  };
};


const SoloComponentV2 = connect(mapStateToProps, mapDispatchToProps)(SoloComponent);

export default SoloComponentV2