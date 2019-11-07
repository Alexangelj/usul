import React from 'react';
import './Footer'

export default class Footer extends React.Component {
    render () {
    return (
        <div className="text-center">
            <footer>
                <div className="container">
                  <p>&copy; Treasure 2019. All Rights Reserved.</p>
                  <ul className="list-inline">
                    <li className="list-inline-item">
                      <a href="#">Privacy</a>
                    </li>
                    <li className="list-inline-item">
                      <a href="#">Terms</a>
                    </li>
                    <li className="list-inline-item">
                      <a href="#">FAQ</a>
                    </li>
                  </ul>
                </div>
            </footer>
        </div>
    );
    }
}