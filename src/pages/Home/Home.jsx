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
import { ChevronRight, Search } from 'lucide-react';


const Home = () => {
  const api = axios.create({
    baseURL: process.env.REACT_APP_DOMAIN,
  });

  if(localStorage.getItem('vercel-toolbar-token')){
    localStorage.removeItem('vercel-toolbar-token');
  }

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
    <div className="container mx-auto px-4">
      {/* 모바일용 가로 스크롤 레이아웃 */}
      <div className="md:hidden w-full overflow-x-auto scrollbar-hide">
        <div className="flex space-x-4 pb-4 px-1">
          {Array.isArray(studies) && studies.length > 0 ? (
            studies.slice(0, 7).map((study) => (
              <div key={study.studyId} className="flex-none w-[280px]">
                <StudyCard study={study} />
              </div>
            ))
          ) : (
            <div className="w-full">

            </div>
          )}
          
          {studies.length > 6 && (
            <div className="flex-none w-[280px]">
              <Link to="/study/list">
                <div className="bg-white rounded-lg p-4 flex flex-col items-center justify-center h-full cursor-pointer hover:shadow-lg transition-shadow duration-200 border border-gray-200">
                  <ChevronRight className="w-12 h-12 text-blue-500 mb-3" />
                  <p className="text-lg font-bold text-center text-gray-800">
                    스터디를 더 보러 가볼까요?
                  </p>
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* 태블릿/데스크톱용 그리드 레이아웃 */}
      <div className="hidden md:grid grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.isArray(studies) && studies.length > 0 ? (
          studies.slice(0, 7).map((study) => (
            <div key={study.studyId}>
              <StudyCard study={study} />
            </div>
          ))
        ) : (
          <div className="col-span-full">
            
          </div>
        )}
        
        {studies.length > 6 && (
          <div>
            <Link to="/study/list">
              <div className="bg-white rounded-lg p-4 flex flex-col items-center justify-center h-full cursor-pointer hover:shadow-lg transition-shadow duration-200">
                <ChevronRight className="w-12 h-12 text-blue-500 mb-3" />
                <p className="text-lg font-bold text-center text-gray-800">
                  스터디를 더 보러 가볼까요?
                </p>
              </div>
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <Header />
      <Container fluid className="px-0">
        <HomeStudyList studies={studies} />
      </Container>
      <Footer />
    </>
  );
};

export default Home;
