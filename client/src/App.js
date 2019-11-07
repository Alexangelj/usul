import React from 'react';
import './App.css';
//import logo from './logo.svg';

import { Drizzle, generateStore, EventActions } from "drizzle";
import { DrizzleContext } from "drizzle-react";
import { newContextComponents } from "drizzle-react-components";
import drizzleOptions from './drizzleOptions';
import { Container, Col, Row, Toast, Jumbotron } from 'react-bootstrap'
import Clipboard from './Clipboard.js'


const { AccountData, ContractData, ContractForm } = newContextComponents;

const drizzleStore = generateStore(
  drizzleOptions
)

const drizzle = new Drizzle(drizzleOptions, drizzleStore);

const myRender = data => (
  <>
    Value=<b>{data}</b>
  </>
);

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
        //<MyDrizzleApp drizzle={drizzle} drizzleState={drizzleState} />
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
                              <Clipboard 
                                drizzle={drizzle} 
                                drizzleState={drizzleState} 
                                accountIndex={0}
                              /></h5>
                            </div>
                            <div><h5>Balance: <span className="span-text">{balance}</span> {units}</h5></div>
                          </div>
                        )}
                    />
                    </div>
                    <div>
                    <h1>Quick Guide</h1>
                    <h4>How does this token work?</h4>
                    <p>
                      1. <strong>Login:</strong> Connect to a Web 3.0 provider like MetaMask, a browser plugin, to transact with the website.
                    </p>
                    <p>
                      2. <strong>Interaction:</strong> Send tokens to accounts using the website's 'Transfer' form.
                    </p>
                    <p>
                      3. <strong>Ledger of Accounts:</strong> The code stores a list of addresses and their respective token balances.
                    </p>
                    </div>
                    <div>
                    <h1>The Treasure Token</h1>
                    <p>
                    Treasure tokens are a valueless token that help you engage with the website.
                    </p>
                    <p>
                      <strong>Total Supply: </strong>
                      <ContractData
                        drizzle={drizzle}
                        drizzleState={drizzleState}
                        contract="TrsrToken"
                        method="totalSupply"
                        methodArgs={[{ from: accounts[0] }]}
                      />{" "}
                      <ContractData
                        drizzle={drizzle}
                        drizzleState={drizzleState}
                        contract="TrsrToken"
                        method="symbol"
                        hideIndicator
                      />
                    </p>
                    <p>
                      <strong>Your Balance: </strong>
                      <ContractData
                        drizzle={drizzle}
                        drizzleState={drizzleState}
                        contract="TrsrToken"
                        method="balanceOf"
                        methodArgs={[accounts[0]]}
                      />{" "}
                        <ContractData
                          drizzle={drizzle}
                          drizzleState={drizzleState}
                          contract="TrsrToken"
                          method="symbol"
                          hideIndicator
                        />
                    </p>
                    </div>
                    <div>
                    <h1>Transfer</h1>
                    <p>This form lets you transfer your balance of Treasure tokens to another Ethereum network address.
                    </p>
                      <ContractForm
                        drizzle={drizzle}
                        drizzleState={drizzleState}
                        contract="TrsrToken"
                        method="transfer"
                        render={({ inputs, inputTypes, state, handleInputChange, handleSubmit }) => (
                          <form onSubmit={handleSubmit} className="form-inline">
                            {inputs.map((input, index) => (
                              <div className="form-group">
                                <input
                                  className="form-control mb-2 mr-sm-2"
                                  style={{ fontSize: 30 }}
                                  key={input.name}
                                  type={inputTypes[index]}
                                  name={input.name}
                                  value={state[input.name]}
                                  placeholder={input.name}
                                  onChange={handleInputChange}
                                />
                              </div>
                            ))}
                              <button
                                key="submit"
                                type="button"
                                className="btn btn-primary btn-dark mb-2"
                                onClick={handleSubmit}
                                style={{ fontSize: 30 }}
                              >Transfer
                              </button>
                          </form>
                        )}
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