import React from 'react';
import './NavBar.css';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap'

export default class NavBarTop extends React.Component {
    render () {
    return (
      <Navbar collapseOnSelect expand="lg" variant="dark" id="mainNav">
      <Navbar.Brand href="#home">Treasure</Navbar.Brand>
      <Navbar.Toggle aria-controls="responsive-navbar-nav" />
      <Navbar.Collapse id="responsive-navbar-nav">
        <Nav id="mainNav" className="mr-auto">
          <Nav.Link id="mainNav" href="#code">Code</Nav.Link>
          <Nav.Link id="mainNav" href="#token">Token</Nav.Link>
        </Nav>
        <Nav>
          <Nav.Link href="#deets">About</Nav.Link>
          <Nav.Link eventKey={2} href="#memes">
            Contact
          </Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
    );
  }
}