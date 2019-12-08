import React from 'react'
import { connect } from 'react-redux'
import ProductList from '../components/Pages/Home/ProductList'


const  mapStateToProps = state =>  {
    return {
        product: state.product
    };
};

export default connect(mapStateToProps)(ProductList);