import React from 'react'
import { Nav, Navbar } from 'react-bootstrap'


class Navigation extends React.Component {
    render() {
        return (
            <div>
            <Navbar>
                <Navbar.Brand href='/home'>USUL</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                      <Nav className="mr-auto">
                        <Nav.Link href="/home">Home</Nav.Link>
                        <Nav.Link href="/solo">Solo</Nav.Link>
                        <Nav.Link href="https://github.com/Alexangelj/usul">Github</Nav.Link>
                        <Nav.Link href="/faq">F.A.Q.</Nav.Link>
                        <Nav.Link href="/admin">Admin</Nav.Link>
                        <Nav.Link href="/solo2">Solo Beta</Nav.Link>
                      </Nav>
                    </Navbar.Collapse>
            </Navbar>
            </div>
        )
    }
}

export default Navigation