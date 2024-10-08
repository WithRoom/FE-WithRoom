import React, { useState, useEffect } from 'react';
import { Container, Grid, Tabs, Tab, Button, CircularProgress, Pagination, Box } from '@mui/material';
import axios from 'axios';
import StudyCard from '../Study/StudyCard';
import { Link } from 'react-router-dom';
import { FaCubes } from 'react-icons/fa';
import SendIcon from '@mui/icons-material/Send';


// 상수 정의
const TABS = {
  CREATED: 'created',
  PARTICIPATING: 'participating',
  REQUEST_JOIN: 'request-join',
  LIKED: 'liked',
  JOIN: 'join'
};

const TAB_ENDPOINTS = {
  [TABS.CREATED]: '/study/mypage/info/mystudy',
  [TABS.PARTICIPATING]: '/study/mypage/info/part',
  [TABS.REQUEST_JOIN]: '/study/mypage/info/request-join',
  [TABS.LIKED]: '/study/mypage/info/interest',
  [TABS.JOIN]: '/study/mypage/info/join'
};

const TAB_LABELS = {
  [TABS.CREATED]: '내가 만든 스터디',
  [TABS.PARTICIPATING]: '참여 중 스터디',
  [TABS.REQUEST_JOIN]: '참여 신청 온 스터디',
  [TABS.LIKED]: '관심 스터디',
  [TABS.JOIN]: '신청한 스터디'
};

const EMPTY_MESSAGES = {
  [TABS.CREATED]: '생성한 스터디가 없습니다.',
  [TABS.PARTICIPATING]: '참여 중인 스터디가 없습니다.',
  [TABS.REQUEST_JOIN]: '참여 신청 온 스터디가 없습니다.',
  [TABS.LIKED]: '관심 스터디가 없습니다.',
  [TABS.JOIN]: '참여 신청한 스터디가 없습니다.'
};

// 컴포넌트들
const StudyList = ({ studies, cardType }) => (
  <Grid container spacing={3}>
    {studies.map((study) => (
      <Grid item xs={12} md={4} key={study.studyId}>
        <StudyCard study={study} cardType={cardType} />
      </Grid>
    ))}
  </Grid>
);

const LoadingSpinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
    <CircularProgress />
  </div>
);

const EmptyState = ({ message }) => (
  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '25vh' }}>
    <FaCubes size={200} color="gray" />
    <p>{message}</p>
  </div>
);

// 커스텀 훅
const useStudies = (activeTab) => {
  const api = axios.create({
    baseURL: process.env.REACT_APP_DOMAIN,
  });

  const [studies, setStudies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchStudies = async () => {
      setIsLoading(true);
      try {
        const endpoint = TAB_ENDPOINTS[activeTab];
        const response = await api.get(process.env.REACT_APP_DOMAIN + endpoint, {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        });

        const studyMapping = {
          [TABS.CREATED]: 'groupLeaderStudies',
          [TABS.PARTICIPATING]: 'participationStudies',
          [TABS.REQUEST_JOIN]: 'responseSignUpStudies',
          [TABS.LIKED]: 'interestStudies',
          [TABS.JOIN]: 'signUpStudies'
        };

        setStudies(response.data[studyMapping[activeTab]] || []);
      } catch (error) {
        console.error('스터디 목록을 불러오는데 실패했습니다:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudies();
  }, [activeTab]);

  return { studies, isLoading };
};

// 메인 컴포넌트
const MyInfo = () => {
  const [activeTab, setActiveTab] = useState(TABS.CREATED);
  const { studies, isLoading } = useStudies(activeTab);
  
  // 페이지네이션 관련 상태 추가
  const [currentPage, setCurrentPage] = useState(1);
  const studiesPerPage = 6; // 페이지당 6개의 스터디를 표시

  // 페이지네이션을 위한 현재 페이지의 스터디 계산
  const indexOfLastStudy = currentPage * studiesPerPage;
  const indexOfFirstStudy = indexOfLastStudy - studiesPerPage;
  const currentStudies = studies.slice(indexOfFirstStudy, indexOfLastStudy);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setCurrentPage(1); // 탭이 변경될 때 페이지를 첫 페이지로 초기화
  };

  const renderContent = () => {
    if (isLoading) return <LoadingSpinner />;
    if (studies.length === 0) return <EmptyState message={EMPTY_MESSAGES[activeTab]} />;
    return <StudyList studies={currentStudies} cardType={activeTab} />;
  };

  return (
    <Container>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          {Object.entries(TAB_LABELS).map(([key, label]) => (
            <Tab key={key} label={label} value={key} />
          ))}
        </Tabs>
        <Link to="/study" style={{ textDecoration: 'none' }}>
            <Button variant="contained" endIcon={<SendIcon />}>
            스터디 만들기
            </Button>
        </Link>
      </Box>

      {renderContent()}

      {/* 페이지네이션 추가 */}
      {studies.length > studiesPerPage && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
          <Pagination
            count={Math.ceil(studies.length / studiesPerPage)} // 총 페이지 수
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
          />
        </div>
      )}
    </Container>
  );
};

export default MyInfo;