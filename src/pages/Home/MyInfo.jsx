import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Tabs, 
  Tab, 
  Button, 
  CircularProgress, 
  Pagination, 
  Box,
  useTheme,
  useMediaQuery,
  IconButton,
  Menu,
  MenuItem,
  Typography
} from '@mui/material';
import axios from 'axios';
import StudyCard from '../Study/StudyCard';
import { Link } from 'react-router-dom';
import { FaCubes } from 'react-icons/fa';
import SendIcon from '@mui/icons-material/Send';
import MenuIcon from '@mui/icons-material/Menu';

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
  <Grid container spacing={2}>
    {studies.map((study) => (
      <Grid item xs={12} sm={6} md={4} key={study.studyId}>
        <StudyCard study={study} cardType={cardType} />
      </Grid>
    ))}
  </Grid>
);

const LoadingSpinner = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
    <CircularProgress />
  </Box>
);

const EmptyState = ({ message }) => (
  <Box 
    display="flex" 
    flexDirection="column" 
    justifyContent="center" 
    alignItems="center" 
    minHeight="300px"
    p={2}
  >
    <FaCubes size={100} color="gray" style={{ marginBottom: '16px' }} />
    <Typography variant="body1" color="textSecondary" align="center">
      {message}
    </Typography>
  </Box>
);

// 모바일 탭 메뉴 컴포넌트
const MobileTabMenu = ({ activeTab, handleTabChange }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (value) => {
    handleTabChange(null, value);
    handleClose();
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Button
        fullWidth
        variant="outlined"
        onClick={handleClick}
        endIcon={<MenuIcon />}
        sx={{ justifyContent: 'space-between' }}
      >
        {TAB_LABELS[activeTab]}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: {
            width: '100%',
            maxWidth: '300px'
          }
        }}
      >
        {Object.entries(TAB_LABELS).map(([key, label]) => (
          <MenuItem
            key={key}
            selected={key === activeTab}
            onClick={() => handleMenuItemClick(key)}
          >
            {label}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

// 커스텀 훅
const useStudies = (activeTab) => {
  const api = axios.create({
    baseURL: process.env.REACT_APP_DOMAIN,
  });

  const [studies, setStudies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudies = async () => {
      setIsLoading(true);
      setError(null);
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
        setError('스터디 목록을 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudies();
  }, [activeTab]);

  return { studies, isLoading, error };
};

// 메인 컴포넌트
const MyInfo = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeTab, setActiveTab] = useState(TABS.CREATED);
  const { studies, isLoading, error } = useStudies(activeTab);
  const [currentPage, setCurrentPage] = useState(1);
  const studiesPerPage = isMobile ? 4 : 6;

  const indexOfLastStudy = currentPage * studiesPerPage;
  const indexOfFirstStudy = indexOfLastStudy - studiesPerPage;
  const currentStudies = studies.slice(indexOfFirstStudy, indexOfLastStudy);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    // 페이지 변경 시 상단으로 부드럽게 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setCurrentPage(1);
  };

  const renderContent = () => {
    if (isLoading) return <LoadingSpinner />;
    if (error) return <EmptyState message={error} />;
    if (studies.length === 0) return <EmptyState message={EMPTY_MESSAGES[activeTab]} />;
    return <StudyList studies={currentStudies} cardType={activeTab} />;
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 3 }}>
        {/* 모바일에서는 드롭다운 메뉴, 데스크톱에서는 탭으로 표시 */}
        {isMobile ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <MobileTabMenu activeTab={activeTab} handleTabChange={handleTabChange} />
            <Button
              component={Link}
              to="/study"
              variant="contained"
              fullWidth
              endIcon={<SendIcon />}
              sx={{ mb: 2 }}
            >
              스터디 만들기
            </Button>
          </Box>
        ) : (
          <Box 
            display="flex" 
            justifyContent="space-between" 
            alignItems="center"
            sx={{ 
              flexDirection: { xs: 'column', md: 'row' },
              gap: { xs: 2, md: 0 }
            }}
          >
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '.MuiTabs-scrollButtons': {
                  '&.Mui-disabled': {
                    opacity: 0.3,
                  },
                },
              }}
            >
              {Object.entries(TAB_LABELS).map(([key, label]) => (
                <Tab 
                  key={key} 
                  label={label} 
                  value={key}
                  sx={{
                    minWidth: { xs: 'auto', sm: 120 },
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }}
                />
              ))}
            </Tabs>
            <Button
              component={Link}
              to="/study"
              variant="contained"
              endIcon={<SendIcon />}
              sx={{ minWidth: 140 }}
            >
              스터디 만들기
            </Button>
          </Box>
        )}
      </Box>

      {renderContent()}

      {studies.length > studiesPerPage && (
        <Box 
          display="flex" 
          justifyContent="center" 
          mt={4} 
          mb={2}
          sx={{
            '& .MuiPagination-ul': {
              justifyContent: 'center',
            }
          }}
        >
          <Pagination
            count={Math.ceil(studies.length / studiesPerPage)}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            size={isMobile ? "small" : "medium"}
            siblingCount={isMobile ? 0 : 1}
          />
        </Box>
      )}
    </Container>
  );
};

export default MyInfo;