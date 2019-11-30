import React from 'react';
import './App.css';
//import logo from './logo.svg';
import { Container, Col, Row, Form, FormGroup, FormControl, HelpBlock, Button, ButtonToolbar, Modal, Table, Tab, Tabs, Card, CardDeck, CardGroup } from 'react-bootstrap'
import BootstrapTable from 'react-bootstrap-table-next'
import Web3 from 'web3';
import getWeb3 from './getWeb3'
import Udr from './artifacts/UDR.json'
import Stk from './artifacts/STK.json'
import Solo from './artifacts/Solo.json'
import SoloComponent from './components/SoloComponent'
import UdrComponent from './components/UdrComponent'
import { bool } from 'prop-types';


class SoloApp extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
          soloInstance: undefined,
          solo_address: undefined,
          udrInstance: undefined,
          udr_address: undefined,
          stkInstance: undefined,
          stk_address: undefined,
          soloBalance: undefined,
          udrBalance: undefined,
          stkBalance: undefined,
          soloSymbol: undefined,
          udrSymbol: undefined,
          stkSymbol: undefined,
          soloRatio: undefined,
          stkUnlocked: bool,
          udrUnlocked: bool,
          balances: [],
          transferTo: undefined,
          transferAmount: undefined,
          transactions: [],
          account: null,
          web3: null,
        }
        this.handleApproveStk = this.handleApproveStk.bind(this);
        this.handleApproveUdr = this.handleApproveUdr.bind(this);
      }
    
      
    componentDidMount = async () => {
      try {
        const web3 = await getWeb3();
        const accounts = await web3.eth.getAccounts();
        const networkId = await web3.eth.net.getId();
        //const networkId = '5777'
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

        this.setState({
          soloSymbol: soloSymbol, 
          soloBalance: this.state.web3.utils.fromWei(soloBalance, 'ether'),
          soloRatio: soloRatio,
        });
      }
      if(typeof this.state.udrInstance !== 'undefined') {
          const udrSymbol = await this.state.udrInstance.methods.symbol().call()
          const udrBalance = await this.state.udrInstance.methods.balanceOf(this.state.account).call()
          
          this.setState({
            udrSymbol: udrSymbol, 
            udrBalance: this.state.web3.utils.fromWei(udrBalance, 'ether'),
          });
        } 
      if(typeof this.state.stkInstance !== 'undefined') {
        const stkSymbol = await this.state.stkInstance.methods.symbol().call()
        const stkBalance = await this.state.stkInstance.methods.balanceOf(this.state.account).call()
        
        this.setState({
          stkSymbol: stkSymbol, 
          stkBalance: this.state.web3.utils.fromWei(stkBalance, 'ether'),
        });
      }
      const balArray = this.state.balances.slice();
      balArray.push({_asset: this.state.soloSymbol, _amount: this.state.soloBalance});
      balArray.push({_asset: this.state.udrSymbol, _amount: this.state.udrBalance});
      balArray.push({_asset: this.state.stkSymbol, _amount: this.state.stkBalance});
      console.log(balArray);
      this.setState({balances: balArray});
    }

    async handleApproveStk(event) {
        if(typeof this.state.stkInstance !== 'undefined') {
            event.preventDefault();
            console.log('Unlocking Strike Asset')
            let result = await this.state.stkInstance.methods.approve(this.state.solo_address,
                this.state.web3.utils.toWei('1000000'))
                .send({from: this.state.account})
        }
        this.setState({stkUnlocked: true})
        console.log('Strike Asset is undefined')
    }   
    async handleApproveUdr(event) {
        if(typeof this.state.udrInstance !== 'undefined') {
            event.preventDefault();
            console.log('Unlocking Underlying Asset')
            let result = await this.state.udrInstance.methods.approve(this.state.solo_address,
                this.state.web3.utils.toWei('1000000'))
                .send({from: this.state.account})
        }
        this.setState({udrUnlocked: true})
        console.log('Underlying Asset is undefined')
    }  
    

    render() {
      if(!this.state.web3) {
        return <div>Loading Web3, accounts, and contract...</div>
      }
      const columns = [{
          dataField: '_asset',
          text: 'Asset',
        }, {
          dataField: '_amount',
          text: 'Amount',
        }];
      return (
        <div className="SoloApp">
          <Container fluid>
            <Row>
              <Col>
              <h1 className='text-center'>The Solo Contract: The Right to Purchase Underlying Assets for Strike Assets <br/></h1>
              <h5 className='text-center'>version: alpha v0.1</h5>
                <h2 className="text-center">How do I use this contract?</h2>
                  <CardDeck>
                    <Card>
                      <Card.Body>
                        <Card.Title><b>Step 1.</b> <strong>Unlock</strong> Strike Asset and Underlying Asset</Card.Title>
                        <Card.Text>
                          Unlocking will allow the Solo contract to take deposits
                          of the Strike and Underlying assets.
                        </Card.Text>
                      </Card.Body>
                      <Card.Footer>
                        <small className="text-muted">1</small>
                      </Card.Footer>
                    </Card>
                    <Card>
                      <Card.Body>
                        <Card.Title><b>Step 2.</b> <strong>Write</strong> The Contract</Card.Title>
                        <Card.Text>
                            This will do the following actions:<br/>
                            <b>a.</b> Deposit an Amount
                            of underlying tokens.<br/>{' '}
                            <b>b.</b> Mint an Amount of SOLO Tokens equal
                            to deposit Amount.{' '}
                        </Card.Text>
                      </Card.Body>
                      <Card.Footer>
                        <small className="text-muted">2</small>
                      </Card.Footer>
                    </Card>
                    <Card>
                      <Card.Body>
                        <Card.Title><b>Step 3.</b><strong>Trade</strong>, <strong>Exercise</strong>, or <strong>Close</strong> SOLO Tokens</Card.Title>
                        <Card.Text>
                            <b>Trade.</b> SOLO is an ERC-20 Token which can be
                            traded freely.<br/>{' '}
                            <b>Exercise.</b> Purchase 1 UDR token for {this.state.soloRatio} STK
                            tokens and 1 SOLO token.
                            <br/>{' '}
                            <b>Close.</b> Withdraw your locked UDR tokens by burning SOLO tokens.{' '}
                        </Card.Text>
                      </Card.Body>
                      <Card.Footer>
                        <small className="text-muted">3</small>
                      </Card.Footer>
                    </Card>
                  </CardDeck>
              </Col>
            </Row>
          <Row>
              
              <Col>
              <h1>Wallet Balance</h1>
                  <BootstrapTable
                    bootstrap4 striped hover condensed
                    id='_asset' 
                    keyField='_asset' 
                    data={this.state.balances} 
                    columns={columns}
                  />
                    <ButtonToolbar>
                        <Button onClick={this.handleApproveStk}>Unlock Strike Asset</Button>
                        <Button onClick={this.handleApproveUdr}>Unlock Underlying Asset</Button>
                    </ButtonToolbar>
              </Col>
            <Col>
            <h1>The Solo Contract</h1>
              <SoloComponent
                  soloInstance={this.state.soloInstance}
                  udrInstance={this.state.udrInstance}
                  stkInstance={this.state.stkInstance}
                  web3={this.state.web3}
                  account={this.state.account}
                  solo_address={this.state.solo_address}
                  udr_address={this.state.udr_address}
                  stk_address={this.state.stk_address}
              />
            </Col>
            <Col>
            <h1>F.A.Q</h1>
                <Card>
                      <Card.Body>
                        <Card.Text>
                            
                            <h3> What is this?</h3>
                            <p>
                            The Solo Contract has a <strong>SOLO</strong> Token which
                            can be freely traded between any ethereum account or contract.
                            These tokens have extended functionality through the Solo Contract and represent
                            the contractual agreement of the Solo Contract.
                            </p>
                            <br/>
                            <h3> What does this smart contract do?</h3>
                            <p>
                            The Solo Contract is a contractual agreement between a <i>Writer </i>
                            and a <i>Buyer</i> that gives the <i>Buyer</i> the right to purchase <strong>1 UDR</strong> token
                            for <strong>{this.state.soloRatio} STK</strong> tokens.
                            </p>
                            <br/>
                            <h3> How are SOLO tokens created?</h3>
                            <p>
                            <i>Writers</i> deposit Underlying tokens into the contract and in return
                            receive newly minted <strong>SOLO</strong> tokens. <i>Buyers</i> are
                            Users who purchase the SOLO tokens from <i>Writers</i>.
                            </p>
                            <br/>
                            <h3> What is valuable about SOLO tokens?</h3>
                            <p>
                            Users who own the <strong>SOLO</strong> tokens can <strong>Exercise</strong> their Right
                            to Purchase an Underlying token for a price equal to {this.state.soloRatio} Strike 
                            tokens. Exercising this right will expend the <i>Buyer's</i> token by burning it.
                            </p>
                            <br/>
                            <h3> Can we estimate a SOLO token's value?</h3>
                            <p>
                            <strong>SOLO</strong> tokens are backed by the underlying asset at a 1:1 ratio, this is 
                            the <i>intrinsic</i> value of the <strong>SOLO</strong> token. <strong>SOLO</strong> tokens
                            have <i>optionality</i>, 'The value of additional optional investment
                            opportunities available only after 
                            having made an initial investment.'
                            over the life of the contract, which is a part of
                            the <strong>SOLO</strong> token's <i>extrinsic</i> value. This combined
                            value is a rough estimate of the value of each token.
                            </p>
                            <br/>
                            <h3> In what cases does the value of SOLO tokens change?</h3>
                            <p>
                            <strong>SOLO</strong> tokens become more valuable in the upside case if the Underlying
                            tokens appreciate more than the Strike tokens. <strong>SOLO</strong> tokens
                            become less valuable in the downside case if the Underlying tokens depreciate more
                            than the Strike tokens.
                            </p>
                            <br/>
                            <h3> What are STK and UDR tokens?</h3>
                            <p>
                            These tokens were created to demonstrate how SOLO tokens work. STK and UDR
                            tokens carry no value in this case.
                            </p>
                            <br/>
                            <p>
                            In the next versions of this contract,
                            the Underlying and Strike assets can be any ERC-20 Token. For example,
                            the Strike asset could be DAI, and the Underlying asset could be MKR. 
                            The contract has a ratio of 550. A SOLO token owner then has the Right
                            to Purchase 1 MKR token for 550 DAI tokens. They benefit from any price appreciation
                            of the MKR tokens. Instead of buying MKR tokens for 600 DAI on the market, they can
                            exercise their SOLO token and purchase it for 550 DAI. Or, instead of exercising,
                            they could sell their SOLO token on the market. Since the market rate of MKR is 50 DAI
                            more than the SOLO token's ratio, the SOLO token has an <i>intrinsic</i> value of 50 DAI.
                            It also has some <i>extrinsic</i> value based on the time remaining in the contract. This <i>extrinsic</i> value
                            is the <strong>time value of money</strong>.
                            </p>
                            <br/>
                        </Card.Text>
                      </Card.Body>
                    </Card>
                  
              </Col>
        </Row>
        <Row>
            <Col>
              <UdrComponent
                instance={this.state.stkInstance}
                web3={this.state.web3}
                account={this.state.account}
              />
            </Col>
            <Col>
              <UdrComponent
                instance={this.state.udrInstance}
                web3={this.state.web3}
                account={this.state.account}
              />
            </Col>
            <Col>
              <UdrComponent
                instance={this.state.soloInstance}
                web3={this.state.web3}
                account={this.state.account}
              />
            </Col>
          </Row>
          </Container>
        </div>
      );
    }
}

export default SoloApp