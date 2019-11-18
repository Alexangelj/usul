import React from "react";
import { newContextComponents } from "drizzle-react-components";

const { AccountData, ContractData, ContractForm } = newContextComponents;

export default class Option extends React.Component {
    state = { dataKey: null };
  
    componentDidMount() {
      const { drizzle } = this.props;
      const contract = drizzle.contracts.Factory;
  
      // get and save the key for the variable we are interested in
      const dataKey = contract.methods["name"].cacheCall();
      this.setState({ dataKey });

      var contractConfig = {
        contractName: "0x066408929e8d5Ed161e9cAA1876b60e1fBB5DB75",
        web3Contract: new web3.eth.Contract(/* ... */)
      }
      var events = ['Mint']
      
      // Or using the Drizzle context object
      this.context.drizzle.addContract(contractConfig, events) 
    }

             
    render() {
      const { Factory } = this.props.drizzleState.contracts;
      const name = Factory.name[this.state.dataKey];
      console.log('name is', name)

      let { drizzle } = this.props;
      let { drizzleState }= this.props.drizzleState;
      return (
        <div>
            <h3>Send Tokens</h3>
            <ContractForm
              drizzle={drizzle}
              drizzleState={drizzleState}
              contract="Factory"
              method="transfer"
              labels={["To Address", "Amount to Send"]}
            />
          </div>
      );
    }
  }