import React from "react";
import { newContextComponents } from "drizzle-react-components";

const { AccountData, ContractData, ContractForm } = newContextComponents;

export default class MyDrizzleApp extends React.Component {
    state = { dataKey: null };
  
    componentDidMount() {
      const { drizzle } = this.props;
      const contract = drizzle.contracts.TrsrToken;
  
      // get and save the key for the variable we are interested in
      const dataKey = contract.methods["name"].cacheCall();
      this.setState({ dataKey });
    }
  
    render() {
      const { TrsrToken } = this.props.drizzleState.contracts;
      const name = TrsrToken.name[this.state.dataKey];
      console.log('name is', name)

      let { drizzle } = this.props;
      let { drizzleState }= this.props.drizzleState;
      return (
        <div>
            <h3>Send Tokens</h3>
            <ContractForm
              drizzle={drizzle}
              drizzleState={drizzleState}
              contract="TrsrToken"
              method="transfer"
              labels={["To Address", "Amount to Send"]}
            />
          </div>
      );
    }
  }