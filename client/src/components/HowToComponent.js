import React from 'react'
import { Card, CardDeck } from 'react-bootstrap'
import { StyledCard } from '../theme/components'


class HowToComponent extends React.Component {
    constructor(props) {
        super(props)
      }


    render() {
        return (
            <div>
                <h2 className="text-center">How do I use this contract?</h2>
                  <CardDeck>
                    <StyledCard>
                      <Card.Body>
                        <Card.Title><b>Step 1.</b> <strong>Unlock</strong> Strike Asset and Underlying Asset</Card.Title>
                        <Card.Text>
                          Unlocking will allow the Solo contract to take deposits
                          of the Strike and Underlying assets.
                        </Card.Text>
                      </Card.Body>
                      <Card.Footer>
                        <small className="text-muted">1</small>
                      </Card.Footer>
                    </StyledCard>
                    <StyledCard>
                      <Card.Body>
                        <Card.Title><b>Step 2.</b> <strong>Write</strong> The Contract</Card.Title>
                        <Card.Text>
                            This will do the following actions:<br/>
                            <b>a.</b> Deposit an Amount
                            of underlying tokens.<br/>{' '}
                            <b>b.</b> Mint an Amount of SOLO Tokens equal
                            to deposit Amount.{' '}
                        </Card.Text>
                      </Card.Body>
                      <Card.Footer>
                        <small className="text-muted">2</small>
                      </Card.Footer>
                    </StyledCard>
                    <StyledCard>
                      <Card.Body>
                        <Card.Title><b>Step 3.</b> <strong>Trade</strong>, <strong>Exercise</strong>, or <strong>Close</strong> SOLO Tokens</Card.Title>
                        <Card.Text>
                            <b>Trade.</b> SOLO is an ERC-20 Token which can be
                            traded freely.<br/>{' '}
                            <b>Exercise.</b> Purchase 1 UDR token for {this.props.soloRatio} STK
                            tokens and 1 SOLO token.
                            <br/>{' '}
                            <b>Close.</b> Withdraw your locked UDR tokens by burning SOLO tokens.{' '}
                        </Card.Text>
                      </Card.Body>
                      <Card.Footer>
                        <small className="text-muted">3</small>
                      </Card.Footer>
                    </StyledCard>
                  </CardDeck>
        </div>
        )
    }
}

export default HowToComponent