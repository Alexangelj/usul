import React, { useEffect } from 'react'
import { ThemeProvider as StyledComponentsThemeProvider, createGlobalStyle, css } from 'styled-components'

const white = '#0D083B';

const GlobalStyle = createGlobalStyle`
    body {
        color: ${props => (props.whiteColor ? 'white' : 'black')};
    }
`
export default GlobalStyle