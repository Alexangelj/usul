import React from 'react'
import { Row, Col, Form, FormGroup, FormControl, Container, Card, Dropdown, ListGroup } from 'react-bootstrap'
import BootstrapTable from 'react-bootstrap-table-next'
import Web3 from 'web3';
import getWeb3 from '../../utils/getWeb3'
import Solo from '../../artifacts/Solo'
import { Button, StyledCard, StyledListGroup, StyledFormControl, StyledTable  } from '../../theme/components'
import styled from 'styled-components'
import { connect } from 'react-redux'
import { web3Connect } from '../../reducers/web3Reducer'


export const StyledButton = styled(Button)`
    justify-content: center;
  `
export const StyledTable2 = styled(StyledTable)`
        text-align: center;
        background-color: #292C2F;
        color: white;
        font-size: 1rem;
        border: none;
        outline: none;
        width: 100%;
        padding: 1rem 1rem 1rem 1rem;
        border-radius: 1rem;
        justify-content: center;
    `

class ChainComponent extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            soloinstance: this.props.soloInstance,
            udrInstance: this.props.udrInstance,
            stkInstance: this.props.stkInstance,
            solo_address: this.props.solo_address,
            udr_address: this.props.udr_address,
            stk_address: this.props.stk_address,
            contracts: [],
            name: undefined,
            symbol: undefined,
            stkSymbol: undefined,
            udrSymbol: undefined,
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
    }

    componentDidMount = async () => {
        try {
            await this.props.web3Connect()

            this.setState({
                web3: this.props.web3Wrapper.web3
            })
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

          const stkSymbol = await this.state.stkInstance.methods.symbol().call()
          const udrSymbol = await this.state.udrInstance.methods.symbol().call()
          
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
            stkSymbol: stkSymbol,
            udrSymbol: udrSymbol,
          })
        } 
      }


    render() {
        if(!this.props.web3) {
            return <div>Loading Web3, accounts, and contract... Are you connected to MetaMask?</div>
          }

        return (
          <div>
            <h1 className='text-center'>Option Chain</h1>
                <StyledTable2>
                    <thead>
                        <tr>
                            <th>Symbol</th>
                            <th>Strike Asset</th>
                            <th>Underlying Asset</th>
                            <th>Ratio</th>
                            <th>Maturity</th>
                            <th>Description</th>
                            <th>Address</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td onClick={() => this.props.handleOptionSelect(this.state.symbol)} style={{cursor: 'pointer'}}>{this.state.symbol}</td>
                            <td onClick={() => this.props.handleOptionSelect(this.state.stkSymbol)} style={{cursor: 'pointer'}}>{this.state.stkSymbol}</td>
                            <td onClick={() => this.props.handleOptionSelect(this.state.udrSymbol)} style={{cursor: 'pointer'}}>{this.state.udrSymbol}</td>
                            <td>{this.state.ratio}</td>
                            <td>{this.state.maturity}</td>
                            <td>
                                Right to Purchase <strong>1</strong> UDR 
                                for <strong>{this.state.ratio}</strong> STK before 
                                the Maturity Date.
                            </td>
                            <td>
                                {this.state.solo_address}
                            </td>
                        </tr>
                    </tbody>
                </StyledTable2>
          </div>
        )
    }
}


const mapDispatchToProps = {
    web3Connect,
}


const mapStateToProps = state => {
    return {
        web3Wrapper: state.web3Wrapper,
        isConnected: state.web3Wrapper.isConnected,
    };
};


const ChainComponentV2 = connect(mapStateToProps, mapDispatchToProps)(ChainComponent);


export default ChainComponentV2