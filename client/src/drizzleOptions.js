import Factory from './artifacts/Factory.json'
import cMoat from './artifacts/cMOAT.json'
import pMoat from './artifacts/pMOAT.json'
import Stk from './artifacts/STK.json'
import Udr from './artifacts/UDR.json'


const drizzleOptions = {
    web3: {
        block: false,
        fallback: {
          type: "ws",
          url: "ws://127.0.0.1:9545",
        },
      },
    contracts: [
        Factory,
        cMoat,
        pMoat,
        Stk,
        Udr
    ],
    events: {
    },
    polls: {
        // set polling interval to 30secs so we don't get buried in poll events
        accounts: 30000,
      },
  }

export default drizzleOptions;