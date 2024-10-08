import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header";
import ProfileCard from "../components/ProfileCard";
import MyInfo from "./MyInfo"; // Import the MyInfo component
import { Container, Row, Col } from "react-bootstrap";
import '../css/ProfileCard.css';

const Me = () => {
  const api = axios.create({
    baseURL: process.env.REACT_APP_DOMAIN,
  });

  const [userProfile, setUserProfile] = useState({
    name: "",
    preferredLocation: "",
    interests: []
  });

  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    api.get(process.env.REACT_APP_DOMAIN + '/member/mypage/info', {
      headers: { 
        Authorization: `Bearer ${token}`
      }
    })
    .then(response => {
      const data = response.data;
      setUserProfile({
        name: data.name || "",
        preferredLocation: data.preferredArea || "",
        interests: data.interest ? data.interest.split(',') : []
      });
    })
    .catch(error => {
      console.error("There was an error fetching the user profile!", error);
    });
  }, [token]);

  return (
    <Container>
      <Header />
      <Row className="justify-content-center mt-4">
        <Col md={6}>
          <ProfileCard {...userProfile} />
        </Col>
      </Row>
      <Row className="justify-content-center mt-4">
        <Col md={12}>
          <MyInfo /> 
        </Col>
      </Row>
    </Container>
  );
}

export default Me;