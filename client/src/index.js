import React, { useEffect }  from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './.legacy/v0-Drizzle/App';
import SoloApp from './components/Pages/Solo/SoloApp';
import * as serviceWorker from './serviceWorker';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { Container} from 'react-bootstrap'
import Navigation from './components/Header/Navigation'

import {ThemeProvider} from 'styled-components'
import colors from './theme/colors'
import {createGlobalStyle} from 'styled-components'

import { DrizzleProvider } from "drizzle-react"
import { LoadingContainer } from 'drizzle-react-components'
import drizzleOptions from "./utils/drizzleOptions"
import SoloAppContainer from './containers/SoloAppContainer'

import { createStore, applyMiddleware, vanillaPromise } from 'redux'
import allReducers from './reducers/index'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'

import ProductList from './containers/ProductListContainer'
import FaqComponent from './components/Pages/FAQ/FaqComponent'
import Footer from './components/Footer/Footer'
import AdminComponent from './components/Pages/Admin/AdminComponent'
import SoloAppDrizzle from './.drizzleStuff/SoloAppDrizzle'
import ApproveComponent from './.drizzleStuff/ApproveComponent'

import { DrizzleContext } from 'drizzle-react'
import { Drizzle, generateStore } from 'drizzle'

// V2
import SoloV2 from './components/Pages/Solo/SoloV2'


const drizzleStore = generateStore(drizzleOptions)
const drizzle = new Drizzle(drizzleOptions, drizzleStore)




const white = '#FFFFFF'
const black = '#000000'
//const theme = {
//    secondaryColor: 'white',
//    primaryColor: 'black',
//    borderColor: '#ccc',
//    textColor: darkMode ? white : '#010101',
//    greyText: '#6c7284'
//  };


const theme = darkMode => ({
  white,
  black,
  textColor: darkMode ? white : '#010101',
  greyText: darkMode ? white : '#6C7284',

  // for setting css on <html>
  backgroundColor: darkMode ? '#333639' : white,

  modalBackground: darkMode ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.5)',
  inputBackground: darkMode ? '#202124' : white,
  placeholderGray: darkMode ? '#5F5F5F' : '#E1E1E1',
  shadowColor: darkMode ? '#000' : '#2F80ED',

  // grays
  concreteGray: darkMode ? '#292C2F' : '#FAFAFA',
  mercuryGray: darkMode ? '#333333' : '#E1E1E1',
  silverGray: darkMode ? '#737373' : '#C4C4C4',
  chaliceGray: darkMode ? '#7B7B7B' : '#AEAEAE',
  doveGray: darkMode ? '#C4C4C4' : '#737373',
  mineshaftGray: darkMode ? '#E1E1E1' : '#2B2B2B',
  buttonOutlineGrey: darkMode ? '#FAFAFA' : '#F2F2F2',
  tokenRowHover: darkMode ? '#404040' : '#F2F2F2',

  //blacks
  charcoalBlack: darkMode ? '#F2F2F2' : '#404040',
  // blues
  zumthorBlue: darkMode ? '#212529' : '#EBF4FF',
  malibuBlue: darkMode ? '#E67AEF' : '#5CA2FF',
  royalBlue: darkMode ? '#DC6BE5' : '#2F80ED',
  loadingBlue: darkMode ? '#e4f0ff' : '#e4f0ff',

  // purples
  wisteriaPurple: '#DC6BE5',
  // reds
  salmonRed: '#FF6871',
  // orange
  pizazzOrange: '#FF8F05',
  // yellows
  warningYellow: '#FFE270',
  // pink
  uniswapPink: '#DC6BE5',
  //green
  connectedGreen: '#27AE60',

  //branded
  metaMaskOrange: '#E8831D',



  // connect button when loggedout
  buttonFaded: darkMode ? '#DC6BE5' : '#737373',


})
export const GlobalStyle = createGlobalStyle`
  @import url('https://fontlibrary.org/face/d-din');
  html { font-family: 'D-Din', sans-serif; }
  
  html,
  body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;    
  }
  body > div {
    height: 100%;
    overflow: auto;
    -webkit-overflow-scrolling: touch;
    background-image: linear-gradient(120deg, #fdfbfb 0%, #ebedee 100%);
    padding: 0;
    margin: 0;
    font-family: 'D-Din', sans-serif;
}
  html {
    font-size: 16px;
    font-variant: none;
    color: ${({ theme }) => theme.textColor};
    background-color: ${({ theme }) => theme.backgroundColor};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  }
`


const store = createStore(
    allReducers,
    applyMiddleware(thunk)
  );


ReactDOM.render(
  <DrizzleProvider options={drizzleOptions}>
        <Provider store={store}>
          <ThemeProvider theme={theme}>
            <GlobalStyle />

              <Container fluid>
                <Navigation/>
              </Container>

                <BrowserRouter>
                  <Switch>
                    <Route exact path='/' component={ProductList}/>
                    <Route path='/home' component={ProductList}/>
                    <Route path='/solo' component={SoloAppContainer}/>
                    <Route path='/faq' component={FaqComponent}/>
                    <Route path='/admin' component={AdminComponent}/>
                    <Route path='/solo2' component={SoloV2}/>
                  </Switch>
                </BrowserRouter>

              <Container fluid>
                <Footer />
              </Container>

          </ThemeProvider>
        </Provider>
    </DrizzleProvider>
    ,
    document.getElementById('root')
);


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();


