import React from 'react';
import './Footer'
import styled from 'styled-components'
import {Container, Row, Col } from 'react-bootstrap'

export const StyledFooter= styled.footer`
    min-height: 10%;
    min-height: 10vh;
    display: flex;
    align-items: center;
    margin-top: 10px;
    margin-bottom: 0px;
    text-align: center;
    justify-content: center;
    position: relative;
    padding: 1rem;
  `

export default class Footer extends React.Component {
    render () {
    return (
        <Container fluid>
            <StyledFooter>
                <Row>
                  <p>&copy; Usul 2019. All Rights Reserved. </p>
                  <ul className="text-right">
                    <li className="list-inline-item">
                      <a href="/faq">FAQ</a>
                    </li>
                  </ul>
                </Row>
            </StyledFooter>
        </Container>
    );
    }
}