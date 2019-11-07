import React, { Component } from 'react';
import PropTypes from "prop-types";
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { Toast } from 'react-bootstrap'

class Clipboard extends React.Component {
    constructor(props) {
        super(props);
    }
    render () {
        const address = this.props.drizzleState.accounts[this.props.accountIndex];
        console.log('Address is: ', address)
        return (
            <>
            <CopyToClipboard text={address}
              onCopy={() => {
                this.setState({copied: true});
                console.log('Address is: ', address);
              }}>
              <i className="fa fa-clone" aria-hidden="true"></i>
            </CopyToClipboard>
            <section className="section">
                {this.props.drizzleState.copied ? <span style={{color: 'red'}}>Copied.</span> : null}
            </section>
            </>
        );
    }
}

Clipboard.propTypes = {
    drizzle: PropTypes.object.isRequired,
    drizzleState: PropTypes.object.isRequired,
    accountIndex: PropTypes.number.isRequired,
    copied: PropTypes.bool,
    render: PropTypes.func,
  };


export default Clipboard;