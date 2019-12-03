import web3 from 'web3'
import Udr from './artifacts/UDR.json'
import Stk from './artifacts/STK.json'
import Solo from './artifacts/Solo.json'


const drizzleOptions = {
    web3: {
        block: false,
        fallback: {
          type: "ws",
          url: "ws://127.0.0.1:9545",
        },
      },
    contracts: [
        Udr,
        Stk,
        Solo,
    ],
    events: {
      Udr: ['Transfer', 'Approve'],
      Stk: ['Transfer', 'Approve'],
      Solo: ['Transfer', 'Approve'],
    },
    polls: {
        // set polling interval to 30secs so we don't get buried in poll events
        accounts: 30000,
      },
  }

export default drizzleOptions;