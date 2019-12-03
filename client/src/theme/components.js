import styled, { keyframes } from 'styled-components'
import { darken } from 'polished'
import theme from './index' // from Step #3
import { Row, Table, Card, ListGroup, FormControl, Col } from 'react-bootstrap'

const Header = styled.div`
  background: ${theme.dark};
  color: ${theme.light};
`

export const Button = styled.button.attrs(({ warning}) => ({
  backgroundColor: warning
}))`
  padding: 1rem 2rem 1rem 2rem;
  border-radius: 3rem;
  cursor: pointer;
  user-select: none;
  font-size: 1rem;
  border: none;
  outline: none;
  width: 100%;
  color: black;
  background: #E1E1E1;
  margin-top: 10px;
  margin-bottom: 10px;
`

export const H1 = styled.h1`
    text-align: center;
    color: skyblue;
  `

export const StyledCard = styled(Card)`
    text-align: justify;
    background-color: #292C2F;
    color: white;
    font-size: 1rem;
    border: none;
    outline: none;
    width: 100%;
    padding: 1rem 2rem 1rem 2rem;
    border-radius: 1rem;
  `
export const StyledTable = styled(Table)`
  text-align: center;
  background-color: #292C2F;
  color: white;
  font-size: 1rem;
  border: none;
  outline: none;
  width: 100%;
  padding: 1rem 1rem 1rem 1rem;
  border-radius: 1rem;
  justify-content: center;
`

export const StyledListGroup = styled(ListGroup)`
    border-radius: 3rem;
    font-size: 1rem;
    border: none;
    outline: none;
    width: 100%;
    color: black;
    background: #E1E1E1;
    margin-bottom: 10px;
    margin-top: 10px;
    cursor: text;
  `

export const StyledFormControl = styled(FormControl)`
    padding: 1rem 2rem 1rem 2rem;
    border-radius: 3rem;
    cursor: text;
    font-size: 1rem;
    border: none;
    outline: none;
    width: 100%;
    color: black;
    background: white;
  `

export const StyledCol = styled(Col)`
    min-height: 100%;
    min-height: 100vh;
    display: flex;
    align-items: center;
    
  `