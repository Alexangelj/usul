import STK from '../artifacts/STK.json';
import UDR from '../artifacts/UDR.json';
import SOLO from '../artifacts/Solo.json';


// Contract
export const FETCH_CONTRACT = 'FETCH_CONTRACT';


// Constants
export const FETCH_SYMBOL = 'FETCH_SYMBOL';
export const FETCH_NAME = 'FETCH_NAME';
export const FETCH_DECIMALS = 'FETCH_DECIMALS';
export const FETCH_TOTAL_SUPPLY = 'FETCH_TOTAL_SUPPLY';
export const FETCH_BALANCE = 'FETCH_BALANCE'; // Fetches token balance of contract
export const FETCH_RATIO = 'FETCH_RATIO';
export const FETCH_MATURITY = 'FETCH_MATURITY';
export const FETCH_ADDRESS = 'FETCH_ADDRESS';

// State changing
export const TRANSFER_TOKEN = 'TRANSFER_TOKEN';
export const APPROVE_TOKEN = 'APPROVE_TOKEN';
export const WITHDRAW_TOKEN = 'WITHDRAW_TOKEN';
// SOLO Specific
export const BUY_TOKEN = 'BUY_TOKEN'; 
export const WRITE_TOKEN = 'WRITE_TOKEN';
export const EXERCISE_TOKEN = 'EXERCISE_TOKEN';
export const CLOSE_TOKEN = 'CLOSE_TOKEN';




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


export const getRatio = ({ contract_index }) => {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            if(!getState().web3Wrapper.isConnected) {
                return Promise.resolve();
            }
            getContracts({ getState })
            .then(function(instances) {
                let from = getDefaultAccount({ getState })
                instances[contract_index].methods.ratio().call({from: from})
                .then(function (result) {
                        dispatch({
                            type: FETCH_RATIO,
                            payload: {ratio: result}
                    });
                    resolve();
                }).catch(function (e) {
                        console.log(e);
                        reject();
                });
            });  
    });
}}


export const getBalance = ({ account, contract_index }) => {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            if(!getState().web3Wrapper.isConnected) {
                return Promise.resolve();
            }
            getContracts({ getState })
            .then(function(instances) {
                let from = getDefaultAccount({ getState })
                instances[contract_index].methods.balanceOf(account).call({from: from})
                .then(function (result) {
                        dispatch({
                            type: FETCH_BALANCE,
                            payload: {balance: result}
                    });
                    resolve();
                }).catch(function (e) {
                        console.log(e);
                        reject();
                });
            });  
    });
}}


export const getMaturity = ({ contract_index }) => {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            if(!getState().web3Wrapper.isConnected) {
                return Promise.resolve();
            }
            getContracts({ getState })
            .then(function(instances) {
                let from = getDefaultAccount({ getState })
                instances[contract_index].methods.maturity().call({from: from})
                .then(function (result) {
                        dispatch({
                            type: FETCH_MATURITY,
                            payload: {maturity: result}
                    });
                    resolve();
                }).catch(function (e) {
                        console.log(e);
                        reject();
                });
            });  
    });
}}


export const getAddress = ({ contract_index }) => {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            if(!getState().web3Wrapper.isConnected) {
                return Promise.resolve();
            }
            getContracts({ getState })
            .then(function (result) {
                dispatch({
                    type: FETCH_ADDRESS,
                    payload: {address: result[contract_index]._address}
                });
                resolve();
            }).catch(function (e) {
                    console.log(e);
                    reject();
            });
    });
}}



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


export const approveToken = ({ account, contract_index, _from, _to, _value }) => {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            if(!getState().web3Wrapper.isConnected) {
                return Promise.resolve();
            }

            getContracts({ getState })
            .then(function(instances) {
                instances[contract_index].methods.approve(
                    _to,
                    _value,
                )
                .send({ from: _from })
                .then(function(result) {
                    dispatch({
                        type: APPROVE_TOKEN,
                        payload: {account, approve: result, isApproved: true}
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


export const fetchContract = ({ contract_index}) => {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            if(!getState().web3Wrapper.isConnected) {
                console.log('fetch contract not connected')
                return Promise.resolve();
            }
            console.log('getting contracts')
            getContracts({ getState })
            .then(function (result) {
                console.log('got result ', result[contract_index])
                    dispatch({
                        type: FETCH_CONTRACT,
                        payload: {contract: result[contract_index]}
                });
                resolve();
            }).catch(function (e) {
                    console.log(e);
                    reject();
            });
    });
}}


export const buyToken = ({ account, contract_index, _from, _value }) => {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            if(!getState().web3Wrapper.isConnected) {
                return Promise.resolve();
            }

            getContracts({ getState })
            .then(function(instances) {
                instances[contract_index].methods.purchaseSolo(
                    _value,
                )
                .send({ from: _from })
                .then(function(result) {
                    dispatch({
                        type: BUY_TOKEN,
                        payload: {account, buy: result, isBought: true}
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

export const writeToken = ({ account, contract_index, _from, _value }) => {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            if(!getState().web3Wrapper.isConnected) {
                return Promise.resolve();
            }

            getContracts({ getState })
            .then(function(instances) {
                instances[contract_index].methods.write(
                    _value,
                )
                .send({ from: _from })
                .then(function(result) {
                    dispatch({
                        type: WRITE_TOKEN,
                        payload: {account, write: result, isWrote: true}
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


export const closeToken = ({ account, contract_index, _from, _value }) => {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            if(!getState().web3Wrapper.isConnected) {
                return Promise.resolve();
            }

            getContracts({ getState })
            .then(function(instances) {
                instances[contract_index].methods.close(
                    _value,
                )
                .send({ from: _from })
                .then(function(result) {
                    dispatch({
                        type: CLOSE_TOKEN,
                        payload: {account, close: result, isClosed: true}
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


export const exerciseToken = ({ account, contract_index, _from, _value }) => {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            if(!getState().web3Wrapper.isConnected) {
                return Promise.resolve();
            }

            getContracts({ getState })
            .then(function(instances) {
                instances[contract_index].methods.exercise(
                    _value,
                )
                .send({ from: _from })
                .then(function(result) {
                    dispatch({
                        type: EXERCISE_TOKEN,
                        payload: {account, exercise: result, isExercised: true}
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
    getRatio,
    getMaturity,
    getAddress,
    getBalance,

    transferToken,
    approveToken,
    withdrawToken,
    fetchContract,

    buyToken,
    writeToken,
    closeToken,
    exerciseToken,

];