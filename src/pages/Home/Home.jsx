import React, { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Header from '../components/Header';
import CarouselFadeExample from '../components/CarouselFadeExample'; 
import MainContent from '../Home/MainContent';
import '../css/Home.css';
import axios from 'axios';
import StudyCard from '../Study/StudyCard';
import Footer from '../components/Footer';
import { Card, Button } from 'react-bootstrap';
import more from '../../images/more.png';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';


const Home = () => {
  const api = axios.create({
    baseURL: process.env.REACT_APP_DOMAIN,
  });

  const [nickName, setNickName] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [studies, setStudies] = useState([]);

  // 인증 상태 확인
  const checkAuth = async () => {
    try {
      const checkToken = localStorage.getItem('accessToken');
      const response = await api.get(process.env.REACT_APP_DOMAIN + '/oauth/login/state', {
        headers: { Authorization: `Bearer ${checkToken}` },
      });
      setIsAuthenticated(response.data.state);  // state가 false일 경우도 처리
    } catch (error) {
      console.error('인증 확인 중 오류 발생:', error);
      setIsAuthenticated(false);
    }
  };

  // 사용자 정보 가져오기
  const fetchMemberInfo = async (token) => {
    try {
      const response = await api.get(process.env.REACT_APP_DOMAIN +'/member/mypage/info', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('memberInfo', response.data);
      setNickName(response.data.nickName);
    } catch (error) {
      console.error('회원 정보 가져오기 중 오류 발생:', error);
    }
  };

  // 스터디 목록 가져오기
  const fetchStudies = async () => {
    try {
      const response = await api.get(process.env.REACT_APP_DOMAIN + '/home/info', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      console.log('studies', response.data);
      setStudies(Array.isArray(response.data.homeStudyInfoList) ? response.data.homeStudyInfoList : []);
    } catch (error) {
      console.error('스터디 목록 가져오기 중 오류 발생:', error);
    }
  };

  // 컴포넌트가 마운트될 때 인증과 스터디 데이터를 요청
  useEffect(() => {
    checkAuth();
    fetchStudies();
  }, []);

  // 인증 상태에 따른 사용자 정보 가져오기
  useEffect(() => {
    if (isAuthenticated) {
      const token = localStorage.getItem('accessToken');
      if (token) {
        fetchMemberInfo(token);
      }
    }
  }, [isAuthenticated]);

  // 스터디 목록 컴포넌트
  const HomeStudyList = ({ studies }) => (
    <Container>
      <Row>
        {Array.isArray(studies) && studies.length > 0 ? (
          studies.slice(0, 7).map((study) => (
            <Col key={study.studyId} md={3} className="mb-3">
              <StudyCard study={study} />
            </Col>
          ))
        ) : (
          <Col md={12} className="mb-3">
            <p>No studies available.</p> 
          </Col>
        )}
        {studies.length > 6 && (
          <Col>
            <Link to="/study/list">
              <div className="bg-white rounded-lg p-4 flex flex-col items-center justify-center h-full cursor-pointer border:1px">
                <ChevronRight className="w-12 h-12 text-blue-500 mb-3" />
                <p className="text-lg font-bold text-center text-gray-800">
                  스터디를 더 보러 가볼까요?
                </p>
              </div>
            </Link>
          </Col>
        )}
      </Row>
    </Container>
  );

  return (
    <>
      <Header />
      <Container fluid className="px-0">
        <Container className="py-4">
          <Row className="justify-content-center mb-4">
            {isAuthenticated ? (
              <Col>
                <h2>Welcome, {nickName}!</h2>
              </Col>
            ) : (
              <Col>
                <h2>Please log in to continue.</h2>
              </Col>
            )}
          </Row>
        </Container>
        <HomeStudyList studies={studies} />
      </Container>
      <Footer />
    </>
  );
};

export default Home;
