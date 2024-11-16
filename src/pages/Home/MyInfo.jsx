import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Send,
  Loader2,
  Cube,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Constants
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

// Components
const StudyList = ({ studies, cardType }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {studies.map((study) => (
      <StudyCard key={study.studyId} study={study} cardType={cardType} />
    ))}
  </div>
);

const StudyCard = ({ study, cardType }) => (
  <Card className="h-full">
    <CardContent className="p-4">
      {/* Study card content here */}
    </CardContent>
  </Card>
);

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-32">
    <Loader2 className="h-8 w-8 animate-spin" />
  </div>
);

const EmptyState = ({ message }) => (
  <div className="flex flex-col justify-center items-center h-64 space-y-4">
    <Cube className="h-16 w-16 text-gray-400" />
    <p className="text-gray-500">{message}</p>
  </div>
);

// Custom hook
const useStudies = (activeTab) => {
  const [studies, setStudies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudies = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const endpoint = TAB_ENDPOINTS[activeTab];
        const response = await fetch(process.env.REACT_APP_DOMAIN + endpoint, {
          headers: { 
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch studies');
        }

        const data = await response.json();
        const studyMapping = {
          [TABS.CREATED]: 'groupLeaderStudies',
          [TABS.PARTICIPATING]: 'participationStudies',
          [TABS.REQUEST_JOIN]: 'responseSignUpStudies',
          [TABS.LIKED]: 'interestStudies',
          [TABS.JOIN]: 'signUpStudies'
        };

        setStudies(data[studyMapping[activeTab]] || []);
      } catch (error) {
        setError(error.message);
        console.error('Failed to fetch studies:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudies();
  }, [activeTab]);

  return { studies, isLoading, error };
};

// Pagination component
const Pagination = ({ currentPage, totalPages, onPageChange }) => (
  <div className="flex justify-center items-center space-x-2 mt-6">
    {Array.from({ length: totalPages }, (_, i) => (
      <button
        key={i + 1}
        onClick={() => onPageChange(i + 1)}
        className={`px-3 py-1 rounded ${
          currentPage === i + 1
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 hover:bg-gray-300'
        }`}
      >
        {i + 1}
      </button>
    ))}
  </div>
);

// Main component
const MyInfo = () => {
  const [activeTab, setActiveTab] = useState(TABS.CREATED);
  const { studies, isLoading, error } = useStudies(activeTab);
  const [currentPage, setCurrentPage] = useState(1);
  const studiesPerPage = 6;

  const indexOfLastStudy = currentPage * studiesPerPage;
  const indexOfFirstStudy = indexOfLastStudy - studiesPerPage;
  const currentStudies = studies.slice(indexOfFirstStudy, indexOfLastStudy);
  const totalPages = Math.ceil(studies.length / studiesPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderContent = () => {
    if (isLoading) return <LoadingSpinner />;
    if (error) return <div className="text-red-500 text-center">{error}</div>;
    if (studies.length === 0) return <EmptyState message={EMPTY_MESSAGES[activeTab]} />;
    return <StudyList studies={currentStudies} cardType={activeTab} />;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <Tabs defaultValue={activeTab} className="w-full sm:w-auto" onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 sm:grid-cols-5 w-full sm:w-auto">
              {Object.entries(TAB_LABELS).map(([key, label]) => (
                <TabsTrigger 
                  key={key} 
                  value={key}
                  className="px-2 py-1 text-sm sm:text-base whitespace-nowrap"
                >
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          
          <Link to="/study" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              스터디 만들기
            </Button>
          </Link>
        </div>

        {renderContent()}

        {studies.length > studiesPerPage && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
};

export default MyInfo;