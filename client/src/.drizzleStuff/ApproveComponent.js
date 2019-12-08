import React from "react";
import ContractComponent from './ContractComponent'
import {AccountData} from 'drizzle-react-components'
import { Container, Row, Col } from 'react-bootstrap'
import { DrizzleContext } from 'drizzle-react'
import { Drizzle, generateStore } from 'drizzle'
import drizzleOptions from '../utils/drizzleOptions'


const myRender = data => (
    <>
      Value=<b>{data}</b>
    </>
  );

const drizzleStore = generateStore(
  drizzleOptions
)
  
const drizzle = new Drizzle(drizzleOptions, drizzleStore);


class ApproveComponent extends React.Component {
    render () {
    return (
        <DrizzleContext.Provider drizzle={drizzle}>
            <DrizzleContext.Consumer>
                {drizzleContext => {
                    const { drizzle, drizzleState, initialized } = drizzleContext;
                    if(!initialized) {
                        console.log('Still not initialized', initialized, drizzle, drizzleState, drizzleContext, this.props.drizzle)
                        return 'Loading'
                    }

                    const { accounts } = drizzleState;
                    return (
                        <Container>
                            <ContractComponent
                                drizzle={drizzle}
                                drizzleState={drizzleState}
                                contract='Udr'
                                method='Approve'
                            />
                            <AccountData
                                drizzle={drizzle}
                                drizzleState={drizzleState}
                                accountIndex={0}
                                units='ether'
                                precision={3}
                                render={({ address, balance, units }) => (
                                    <div>
                                      <div>My Address: <span style={{ color: "red" }}>{address}</span></div>
                                      <div>My Ether: <span style={{ color: "red" }}>{balance}</span> {units}</div>
                                    </div>
                                  )}
                            />
                            <h1>Test Approve Component</h1>
                        </Container>
                    );
                }}
            </DrizzleContext.Consumer>
        </DrizzleContext.Provider>
    );}
}

export default ApproveComponent