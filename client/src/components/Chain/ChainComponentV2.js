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
import { 
    fetchContract, 
    getSymbol,
    getRatio,
    getMaturity,
    getAddress,
} from '../../actions/contractActions'
import { 
    STK_INDEX,
    UDR_INDEX,
    SOLO_INDEX
} from '../Pages/Solo/SoloV2'



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

            contracts: [],
            name: undefined,
            symbol: undefined,
            stkSymbol: undefined,
            udrSymbol: undefined,
            ratio: undefined,
            maturity: undefined,

            writes: [],
            underwrite: undefined,
            userBalance: undefined,
            exercises: [],
            exerciseAmount: undefined,
            closes: [],
            closeAmount: undefined,


            account: this.props.account,
            getAccount: this.props.getAccount,
        }
        this.constants = this.constants.bind(this)
        this.getSymbols = this.getSymbols.bind(this)
        this.getDateFromTimestamp = this.getDateFromTimestamp.bind(this)
        this.getMaturity = this.getMaturity.bind(this)
    }


    componentDidMount = async () => {
        try {
            await this.props.web3Connect();
            let account = await this.props.getAccount();

            this.setState({
                web3: this.props.web3Wrapper.web3,
                account: account,
            },
                this.constants
            )
          } catch (error) {
            alert(
              'Failed to load web3, accounts, or contract.'
            );
            console.error(error);
          }
        
    }


    async constants() {
        await this.getSymbols();
        await this.props.getRatio({contract_index: SOLO_INDEX})
        .then(() => {
            console.log('get ratio ', this.props.ratio)
            this.setState({
                ratio: this.props.ratio
            });
        })
        await this.getMaturity();
        await this.props.getAddress({contract_index: SOLO_INDEX})
        .then(() => {
            console.log('get address ', this.props.address)
            this.setState({
                address: this.props.address
            });
        })
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

    
    async getMaturity() {
        await this.props.getMaturity({contract_index: SOLO_INDEX})
        .then(() => {
            console.log('get maturity', this.props.maturity)
            this.setState({
                maturity: this.props.maturity
            });
        })
        let maturityTimestamp = this.state.maturity
        let maturityDate = this.getDateFromTimestamp(maturityTimestamp)
        this.setState({
            maturity: maturityDate
        })
    }


    getDateFromTimestamp(timestamp) {
        const date = new Date(this.state.maturity*1000);
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const year = date.getFullYear();
        const month = months[date.getMonth()];
        const day = date.getDate();
        const hours = date.getHours();
        const minutes = '0' + date.getMinutes();
        const seconds = '0' + date.getSeconds();
        const maturity = day + ' ' + month + ' ' + year + ' ' + hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
        return maturity
    }


    render() {
        if(!this.props.web3Wrapper) {
            return <div>Loading Web3, accounts, and contract... Are you connected to MetaMask? From Chain :)</div>
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
                            <td onClick={() => this.props.handleOptionSelect(this.state.soloSymbol)} style={{cursor: 'pointer'}}>{this.state.soloSymbol}</td>
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
                                {this.state.address}
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
    fetchContract,
    getSymbol,
    getRatio,
    getMaturity,
    getAddress,
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


const ChainComponentV2 = connect(mapStateToProps, mapDispatchToProps)(ChainComponent);

export default ChainComponentV2
