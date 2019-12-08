import Web3 from "web3";
import UDR from '../artifacts/UDR.json'
import STK from '../artifacts/STK.json'
import Solo from '../artifacts/Solo.json'


const drizzleOptions = {
    web3: {
        block: false,
        fallback: {
          type: "ws",
          url: "ws://127.0.0.1:7545",
        },
        customProvider: new Web3.providers.HttpProvider(
          "http://127.0.0.1:7545"
        ),
      },
    contracts: [
        UDR,
        STK,
        Solo,
    ],
    events: {
      Solo: ['Transfer', 'Approve'],
    },
    polls: {
        // set polling interval to 30secs so we don't get buried in poll events
        accounts: 30000,
      },
  }

export default drizzleOptions;