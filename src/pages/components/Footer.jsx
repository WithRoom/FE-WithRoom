import React from "react";
import { Container, Row, Col } from 'react-bootstrap';
const Footer = () => {  
    return (
        <footer className="footer bg-light py-3 mt-auto">
        <Container>
          <Row>
            <Col md={6} className="text-center text-md-start">
              <p className="mb-0">&copy; 2024 Study With Me. All rights reserved.</p>
            </Col>
            <Col md={6} className="text-center text-md-end mt-3 mt-md-0">
              <a href="/contact" className="me-3">Contact Us</a>
              <a href="/privacy">Privacy Policy</a>
            </Col>
          </Row>
        </Container>
    </footer>
    );
}

export default Footer;