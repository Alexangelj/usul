import ApproveComponent from "./ApproveComponent";
import { drizzleConnect } from 'drizzle-react';

const mapStateToProps = state => {
    return {
      accounts: state.accounts,
      Udr: state.contracts.Udr,
      Stk: state.contracts.Stk,
      Solo: state.contracts.Solo,
      drizzleStatus: state.drizzleStatus,
    };
  };
  
  const ContractContainer = drizzleConnect(ApproveComponent, mapStateToProps);
  
  export default ContractContainer;

