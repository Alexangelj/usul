import React from 'react'
import { Card, CardDeck, Accordion } from 'react-bootstrap'
import { StyledCard, Button } from '../theme/components'


class HowToComponent extends React.Component {
    constructor(props) {
        super(props)
      }


    render() {
        return (
            <div>
                <Accordion defaultActiveKey="1">
                <Accordion.Toggle as={Button} variant="link" eventKey="0">
                How do I use this contract?
                  </Accordion.Toggle>
                  <Accordion.Collapse eventKey="0">
                  <CardDeck>
                    <StyledCard>
                      <Card.Body>
                        <Card.Title><b>Step 1.</b> <strong>Unlock</strong> Strike Asset and Underlying Asset</Card.Title>
                        <Card.Text>
                          Unlocking will allow the Solo contract to take deposits
                          of the Strike and Underlying assets.
                        </Card.Text>
                      </Card.Body>
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
                    </StyledCard>
                  </CardDeck>
                  </Accordion.Collapse>
                  </Accordion>
        </div>
        )
    }
}

export default HowToComponent