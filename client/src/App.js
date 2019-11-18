import React from 'react';
import './App.css';
//import logo from './logo.svg';

import { Drizzle, generateStore } from "drizzle";
import { DrizzleContext } from "drizzle-react";
import { newContextComponents } from "drizzle-react-components";
import drizzleOptions from './drizzleOptions';
import { Container, Col, Row } from 'react-bootstrap'
import web3 from 'web3'


const { AccountData, ContractData, ContractForm } = newContextComponents;

const drizzleStore = generateStore(
  drizzleOptions
)

const drizzle = new Drizzle(drizzleOptions, drizzleStore);

function App() {
  return ( 
  <DrizzleContext.Provider drizzle={drizzle}>
   <DrizzleContext.Consumer>
    {drizzleContext => {
      const { 
        drizzle, 
        drizzleState, 
        initialized } = drizzleContext;
      
        if (!initialized) {
        return "Loading... Are you connected to the Web 3.0?";
        }
      const { accounts } = drizzleState;

      
      return (
        <>
          <Container >
            <Row>
              <Col>
                <div>
                <h1>Your Ethereum Account: <i className="fa fa-address-card fa-1.5x" aria-hidden="true"></i></h1> 
                    <AccountData 
                        drizzle={drizzle} 
                        drizzleState={drizzleState} 
                        accountIndex={0} 
                        units="ether" 
                        precision={0} 
                        render={({ address, balance, units }) => (
                          <div>
                            <div>
                              <h5>Address: 
                              <span className="span-text"> {address} </span>{" "}
                              </h5>
                            </div>
                            <div><h5>Balance: <span className="span-text">{balance}</span> {units}</h5></div>
                          </div>
                        )}
                    />{" Total Supply: "}
                    <ContractData
                      drizzle={drizzle}
                      drizzleState={drizzleState}
                      contract="DOZ"
                      method="totalSupply"
                      methodArgs={[{from: accounts[0]}]}
                    />
                    <ContractForm
                      drizzle={drizzle}
                      drizzleState={drizzleState}
                      contract="DOZ"
                      method="approve"
                    />
                    <ContractForm
                      drizzle={drizzle}
                      drizzleState={drizzleState}
                      contract="Factory"
                      method="createDoz"
                    />
                    <ContractData
                      drizzle={drizzle}
                      drizzleState={drizzleState}
                      contract="Factory"
                      method="getOmn"
                      methodArgs={[accounts[0], {from: accounts[0]}]}
                    />
                  </div>
              </Col>
            </Row>
          </Container>
        </>
      );
    }}
    </DrizzleContext.Consumer>
  </DrizzleContext.Provider>
  )
}

export default App;