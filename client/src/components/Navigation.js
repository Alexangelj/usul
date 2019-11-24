import React from 'react'
import { Nav, Navbar } from 'react-bootstrap'


class Navigation extends React.Component {
    render() {
        return (
            <div>
            <Navbar>
                <Navbar.Brand href='#home'>MOAT</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                      <Nav className="mr-auto">
                        <Nav.Link href="#home">Home</Nav.Link>
                        <Nav.Link href="#link">Contact</Nav.Link>
                      </Nav>
                    </Navbar.Collapse>
            </Navbar>
            </div>
        )
    }
}

export default Navigation