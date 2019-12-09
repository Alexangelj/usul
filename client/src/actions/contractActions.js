import STK from '../artifacts/STK.json';
import UDR from '../artifacts/UDR.json';
import SOLO from '../artifacts/Solo.json';


// Constants
export const FETCH_SYMBOL = 'FETCH_SYMBOL';
export const FETCH_NAME = 'FETCH_NAME';
export const FETCH_DECIMALS = 'FETCH_DECIMALS';
export const FETCH_TOTAL_SUPPLY = 'FETCH_TOTAL_SUPPLY';
export const FETCH_BALANCE = 'FETCH_BALANCE'; // Fetches token balance of contract


// State changing
export const TRANSFER_TOKEN = 'TRANSFER_TOKEN';
export const APPROVE_TOKEN = 'APPROVE_TOKEN';
export const WITHDRAW_TOKEN = 'WITHDRAW_TOKEN';
// SOLO Specific
export const BUY_CONTRACT = 'BUY_CONTRACT'; 
export const WRITE_CONTRACT = 'WRITE_CONTRACT';
export const EXERCISE_CONRTRACT = 'EXERCISE_CONRTRACT';
export const CLOSE_CONTRACT = 'CLOSE_CONTRACT';




export const contractList = [
    STK,
    UDR,
    SOLO
];



const getNetworkId = async ({ getState }) => {
    return getState().web3Wrapper.web3.eth.net.getId();
}


const getDefaultAccount = ({ getState }) => {
    return getState().web3Wrapper.web3.eth.accounts[0];
}


const getContracts = async ({ getState }) => {
    const instances = [];
    const networkId = await getState().web3Wrapper.web3.eth.net.getId();
    let web3 = getState().web3Wrapper.web3;
    for(var i=0; i < contractList.length; i++) {
        const DeployedNetwork = contractList[i].networks[networkId];
        instances.push(
            new web3.eth
            .Contract(
                contractList[i].abi, 
                DeployedNetwork && DeployedNetwork.address
                )
            );
    }
    return instances
}


export const getSymbol = ({ account, contract_index}) => {
        return (dispatch, getState) => {
            return new Promise((resolve, reject) => {
                if(!getState().web3Wrapper.isConnected) {
                    return Promise.resolve();
                }
                getContracts({ getState })
                .then(function(instances) {
                    let from = getDefaultAccount({ getState })
                    instances[contract_index].methods.symbol().call({from: from})
                    .then(function (result) {
                            dispatch({
                                type: FETCH_SYMBOL,
                                payload: {account, symbol: result}
                        });
                        resolve();
                    }).catch(function (e) {
                            console.log(e);
                            reject();
                    });


                    instances[contract_index].methods.name().call({from: from})
                    .then(function (result) {
                            dispatch({
                                type: FETCH_NAME,
                                payload: {account, name: result}
                        });
                        resolve();
                    }).catch(function (e) {
                            console.log(e);
                            reject();
                    });


                    instances[contract_index].methods.decimals().call({from: from})
                    .then(function (result) {
                            dispatch({
                                type: FETCH_DECIMALS,
                                payload: {account, decimals: result}
                        });
                        resolve();
                    }).catch(function (e) {
                            console.log(e);
                            reject();
                    });


                    instances[contract_index].methods.totalSupply().call({from: from})
                    .then(function (result) {
                            dispatch({
                                type: FETCH_TOTAL_SUPPLY,
                                payload: {account, totalSupply: result}
                        });
                        resolve();
                    }).catch(function (e) {
                            console.log(e);
                            reject();
                    });

                });  
        });
    }
}


export const transferToken = ({ account, contract_index, _from, _to, _value }) => {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            if(!getState().web3Wrapper.isConnected) {
                return Promise.resolve();
            }

            getContracts({ getState })
            .then(function(instances) {
                instances[contract_index].methods.transfer(
                    _to,
                    _value,
                )
                .send({ from: _from })
                .then(function(result) {
                    dispatch({
                        type: TRANSFER_TOKEN,
                        payload: {account, transfer: result, isTransferred: true}
                    });
                    resolve();
                }).catch(function (e) {
                    console.log('errored', e);
                    reject();
                })
            })
        })
    }
}


export const withdrawToken = ({ account, contract_index, _from, _value }) => {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            if(!getState().web3Wrapper.isConnected) {
                return Promise.resolve();
            }

            getContracts({ getState })
            .then(function(instances) {
                instances[contract_index].methods.withdraw(
                    _value,
                )
                .send({ from: _from })
                .then(function(result) {
                    dispatch({
                        type: WITHDRAW_TOKEN,
                        payload: {account, withdraw: result, isWithdrawn: true}
                    });
                    resolve();
                }).catch(function (e) {
                    console.log('errored', e);
                    reject();
                })
            })
        })
    }
}

export const actions = [
    getSymbol,
    transferToken,
    withdrawToken
];