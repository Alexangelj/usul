import TrsrToken from './artifacts/TrsrToken.json'
import TrsrTokenCrowdsale from './artifacts/TrsrTokenCrowdsale.json'

const drizzleOptions = {
    web3: {
        block: false,
        fallback: {
          type: "ws",
          url: "ws://127.0.0.1:9545",
        },
      },
    contracts: [
        TrsrToken,
        TrsrTokenCrowdsale
    ],
    events: {
        TrsrToken: ["Transfer"]
    },
    polls: {
        // set polling interval to 30secs so we don't get buried in poll events
        accounts: 30000,
      },
  }

export default drizzleOptions;