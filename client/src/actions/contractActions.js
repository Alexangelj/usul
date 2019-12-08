// import Stk from '../artifacts/STK.json'

// export const FETCH_SYMBOL = 'FETCH_SYMBOL'



// const getContracts = ({ getState }) => {
//     const networkId = getState().web3Wrapper.web3.eth.net.getId();
//     const stkDeployedNetwork = Stk.networks[networkId];
//     const stkInstance = new getState().web3Wrapper.web3.eth.Contract(
//       Stk.abi,
//       stkDeployedNetwork && stkDeployedNetwork.address,
//     )
//     return stkInstance
// }

// const getNetworkId = ({ getState }) => {
//     return getState().web3Wrapper.web3.eth.net.getId();
// }


// const getDefaultAccount = ({ getState }) => {
//     return getState().web3Wrapper.web3.eth.accounts[0]
// }


// // export const getSymbol = ({ account }) => {
// //     return (dispatch, getState) => {
// //         return new Promise((resolve, reject) => {
// //             let contract = null
// //             let from = null
// //             getContracts({ getState })
// //             .then(instance => {
// //                 contract = instance
// //                 from = getDefaultAccount({ getState })
// //                 return contract.symbol().call({from: from})
// //             })
// //             .then(function(result){
// //                 dispatch({
// //                     type: FETCH_SYMBOL,
// //                     payload: { 
// //                         account, 
// //                         result: result 
// //                     }
// //                 })
// //                 resolve()
// //             })
// //             .catch(function (error) {
// //                 console.log(error)
// //                 reject()
// //             })
// //         })
// //     }
// // }

// export const getSymbol = ({ account }) => {
//     return (dispatch, getState) => {
//         return new Promise((resolve, reject) => {
//             let contract = null
//             let from = null
//             const networkId = getNetworkId({ getState });
//             const stkDeployedNetwork = Stk.networks[networkId];
//             new getState().web3Wrapper.web3.eth.Contract(
//               Stk.abi,
//               stkDeployedNetwork && stkDeployedNetwork.address,
//             )
//             .then(instance => {
//                 contract = instance
//                 from = getDefaultAccount({ getState })
//                 return contract.symbol().call({from: from})
//             })
//             .then(function (result) {
//                 dispatch({
//                     type: FETCH_SYMBOL,
//                     payload: {account, result: result}
//                 })
//                 resolve()
//             }).catch(function (e) {
//                 console.log(e)
//                 reject()
//             })
//         })
//     }
// }

// export const actions = [
//     getSymbol,
// ]