import SoloApp from "../SoloApp";
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

const SoloAppContainer = drizzleConnect(SoloApp, mapStateToProps);

export default SoloAppContainer;