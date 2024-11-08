import React from 'react';
import Carousel from 'react-bootstrap/Carousel';
import ImageImport from './ImageImport';
import 'bootstrap/dist/css/bootstrap.min.css';
import home from '../../images/HOME.png';
import '../css/Carousel.css';

function CarouselFadeExample() {
  return (
    <div className="carousel-container">
      <Carousel fade>
        <Carousel.Item>
          <a href="https://www.notion.so/Study-With-Me-7ffb049d2bba4814a4da7dc010d8216e">
            <ImageImport src={home} alt="인프런" className="d-block w-100 img-fluid" />
          </a>
        </Carousel.Item>
      </Carousel>
    </div>
  );
}

export default CarouselFadeExample;
