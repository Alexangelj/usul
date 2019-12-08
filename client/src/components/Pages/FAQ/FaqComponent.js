import React from 'react'
import { Nav, Navbar, ButtonToolbar, Card, Container, Col, Row } from 'react-bootstrap'
import { Button } from '../../../theme/components'
import { StyledTable, StyledCard } from '../../../theme/components'


class FaqComponent extends React.Component {
    constructor(props) {
        super(props)
      }
    render() {
        return (
            <Container>
              
              <Col></Col>
              <Row>
              <Col>
            <h1>F.A.Q</h1>
                <StyledCard>
                      <Card.Body>
                        <Card.Text>
                            <h3> What is this?</h3>
                            <p>
                            The Solo Contract has a <strong>SOLO</strong> Token which
                            can be freely traded between any ethereum account or contract.
                            These tokens have extended functionality through the Solo Contract and represent
                            the contractual agreement of the Solo Contract.
                            </p>
                            <br/>
                            <h3> What does this smart contract do?</h3>
                            <p>
                            The Solo Contract is a contractual agreement between a <i>Writer </i>
                            and a <i>Buyer</i> that gives the <i>Buyer</i> the right to purchase <strong>1 UDR</strong> token
                            for <strong>5 STK</strong> tokens.
                            </p>
                            <br/>
                            <h3> How are SOLO tokens created?</h3>
                            <p>
                            <i>Writers</i> deposit Underlying tokens into the contract and in return
                            receive newly minted <strong>SOLO</strong> tokens. <i>Buyers</i> are
                            Users who purchase the SOLO tokens from <i>Writers</i>.
                            </p>
                            <br/>
                            <h3> What is valuable about SOLO tokens?</h3>
                            <p>
                            Users who own the <strong>SOLO</strong> tokens can <strong>Exercise</strong> their Right
                            to Purchase an Underlying token for a price equal of 5 Strike 
                            tokens each. Exercising this right will expend the <i>Buyer's</i> token by burning it.
                            </p>
                            <br/>
                            <h3> Can we estimate a SOLO token's value?</h3>
                            <p>
                            <strong>SOLO</strong> tokens are backed by the underlying asset at a 1:1 ratio, this is 
                            the <i>intrinsic</i> value of the <strong>SOLO</strong> token. <strong>SOLO</strong> tokens
                            have <i>optionality</i>, 'The value of additional optional investment
                            opportunities available only after 
                            having made an initial investment.'
                            over the life of the contract, which is a part of
                            the <strong>SOLO</strong> token's <i>extrinsic</i> value. This combined
                            value is a rough estimate of the value of each token.
                            </p>
                            <br/>
                            <h3> In what cases does the value of SOLO tokens change?</h3>
                            <p>
                            <strong>SOLO</strong> tokens become more valuable in the upside case if the Underlying
                            tokens appreciate more than the Strike tokens. <strong>SOLO</strong> tokens
                            become less valuable in the downside case if the Underlying tokens depreciate more
                            than the Strike tokens.
                            </p>
                            <br/>
                            <h3> What are STK and UDR tokens?</h3>
                            <p>
                            These tokens were created to demonstrate how SOLO tokens work. STK and UDR
                            tokens carry no value in this case.
                            </p>
                            <br/>
                            <p>
                            In the next versions of this contract,
                            the Underlying and Strike assets can be any ERC-20 Token. For example,
                            the Strike asset could be DAI, and the Underlying asset could be MKR. 
                            The contract could be initialized with a ratio of 550. A SOLO token owner then has the Right
                            to Purchase 1 MKR token for 550 DAI tokens. They benefit from any price appreciation
                            of the MKR tokens. For example, if MKR tokens later went up to 600 DAI, instead of buying MKR tokens for 600 DAI on the market, they can
                            exercise their SOLO token and purchase it for 550 DAI. Or, instead of exercising,
                            they could sell their SOLO token on the market. Since the market rate of MKR is 50 DAI
                            more than the SOLO token's ratio, the SOLO token has an <i>intrinsic</i> value of 50 DAI.
                            It also has some <i>extrinsic</i> value based on the time remaining in the contract. This <i>extrinsic</i> value
                            is the <strong>time value of money</strong>.
                            </p>
                            <br/>
                        </Card.Text>
                      </Card.Body>
                    </StyledCard>
                    </Col>
                    </Row>
                    <Col></Col>
                    
        </Container>
        )
    }
}

export default FaqComponent