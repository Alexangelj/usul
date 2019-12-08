import React from 'react';
//import logo from './logo.svg';
import { Container, Col, Row, Form, FormGroup, FormControl, HelpBlock, ButtonToolbar, Modal, Table, Tab, Tabs, Card, CardDeck, CardGroup, Nav } from 'react-bootstrap'
import BootstrapTable from 'react-bootstrap-table-next'
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import Web3 from 'web3';
import getWeb3 from '../utils/getWeb3'
import Udr from '../artifacts/UDR.json'
import Stk from '../artifacts/STK.json'
import Solo from '../artifacts/Solo.json'
import SoloComponent from '../components/ContractInterfaces/SoloComponent'
import UdrComponent from '../components/ContractInterfaces/UdrComponent'
import StkComponent from '../components/ContractInterfaces/StkComponent'
import { bool } from 'prop-types';
import { Button, StyledRow, H1, StyledCol } from '../theme/components'
import styled from 'styled-components'
import WalletComponent from '../components/Wallet/WalletComponent'
import FaqComponent from '../components/Pages/FAQ/FaqComponent'
import HowToComponent from '../components/Tooltips/HowToComponent'
import ChainComponent from '../components/Chain/ChainComponent'
import AdminComponent from '../components/Pages/Admin/AdminComponent'
import TransferComponent from '../components/ContractInterfaces/TransferComponent'
import Transfers from '../components/ContractInterfaces/Transfers'
import ToggleButton from 'react-toggle-button'

// Drizzle
import { drizzleConnect } from 'drizzle-react'
import ContractComponent from './ContractComponent'
import ContractContainer from './ContractContainer';
import ApproveComponent from './ApproveComponent'
import LoadingContainer from './LoadingContainer'
import drizzleOptions from '../utils/drizzleOptions'
import { DrizzleProvider, DrizzleContext } from 'drizzle-react'
import { Drizzle, generateStore } from 'drizzle'

const drizzleStore = generateStore(drizzleOptions)
const drizzle = new Drizzle(drizzleOptions, drizzleStore)

class SoloAppDrizzle extends React.Component {
    render() {
      return (
        <div className="SoloApp">
          <Container fluid>
            <Row>
              <Col>
                <h1 className='text-center'>The Solo Contract: The Right to Purchase Underlying Assets for Strike Assets <br/></h1>
                <h5 className='text-center'>version: alpha v0.1</h5>

              </Col>
            </Row>
          <Row>
            <Col>

            </Col>
            <Col>
            

              <ApproveComponent />


            </Col>
            <Col>

            </Col>
        </Row>
        <Row>
            <Col>

            </Col>
            <Col>

            </Col>
            <Col>

            </Col>
          </Row>
          </Container>
        </div>
      );
    }
}

export default SoloAppDrizzle