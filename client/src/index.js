import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App';
import SoloApp from './SoloApp';
import * as serviceWorker from './serviceWorker';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { Container } from 'react-bootstrap'
import Navigation from './components/Navigation'

ReactDOM.render(
    <>
        <Container fluid>
            <Navigation/>
        </Container>
        <BrowserRouter>
            <Switch>
            <Route path='/home' component={App}/>
            <Route path='/solo' component={SoloApp}/>
            </Switch>
        </BrowserRouter>
    </>,
    document.getElementById('root')
);


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();


