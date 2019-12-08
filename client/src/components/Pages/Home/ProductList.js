import React from 'react'
import './styles.scss'
import {Container, Col} from 'react-bootstrap'


class ProductList extends React.Component {

    createListItems() {
        return this.props.product.map((product) => {
            return (
                <>
                <div className='container h-100'>
                <div className='row h-100 justify-content-center align-items-center'>
                <div key={product.id}>
                    <div className='product' >
                        <img src={product.image} alt={product.name}/>
                        <div className="image_overlay"/>
                        <div className="stats">
                            <div className="stats-container">
                                <span className="product_name">{product.name}</span>
                                <p>{product.description}</p>
                            </div>
                        </div>
                    </div>
                </div>
                </div>
                </div>
                </>
            );
        })
    }
    render () {
        return (
            <Container>
                <Col>
                    <a href='/solo'>
                    {this.createListItems()}
                    </a>
                </Col>
            </Container>
        );
    }
}

export default ProductList;