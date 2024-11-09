import React, { useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { Card } from 'react-bootstrap';
import Swal from 'sweetalert2';
import {Box, Button, Typography} from '@mui/material';
import axios from 'axios';
import { useState } from 'react';
import { set } from 'date-fns';


const StudySchedule = ({ studyScheduleDetail, studyId }) => {
  
  
  const [isFinished, setIsFinished] = useState(false);
  const [homeStudyInfoList, setHomeStudyInfoList] = useState([]);

  useEffect(() => {

    const api = axios.create({
      baseURL: process.env.REACT_APP_DOMAIN, 
    });

    const fetchStudyInfo = async () => {
      try {
        const response = await api.get(process.env.REACT_APP_DOMAIN + `/home/filter/info`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
        });
        const studyInfoList = response.data.homeStudyInfoList;
        setHomeStudyInfoList(studyInfoList);

        const currentStudy = studyInfoList.find((study) => study.studyId === studyId);

        const currentDate = new Date().toISOString().split('T')[0];
        if (currentDate > studyScheduleDetail.endDay || currentStudy.finish === true) {
          setIsFinished(true);
          Swal.fire({
            icon: 'warning',
            title: '마감된 스터디입니다',
            showConfirmButton: true,
          });
        }
      } catch (error) {
        console.error('Error fetching study info:', error);
      }
    };

    fetchStudyInfo();
  }, [studyScheduleDetail.endDay, studyId]);

  const handleFinishStudy = async () => {
    try {
      const response = await axios.post('/study/finish', { studyId }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      });

      if (response.data === true) {
        Swal.fire({
          icon: 'success',
          title: '스터디를 마감합니다.',
          showConfirmButton: true,
        });
        setIsFinished(true);
      } else {
        Swal.fire({
          icon: 'error',
          title: '그룹장만 스터디를 마감할 수 있습니다.',
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error('Error finishing study:', error);
      Swal.fire({
        icon: 'error',
        title: '스터디 마감에 실패했습니다.',
        text: error.message,
      });
    }
  };

  return (
    <Card className="w-64 bg-gray-100 shadow-md" style={{ border: "solid" }}>     
      <Card.Header className="bg-gray-200 py-2 d-flex align-items-center">
          <Calendar className="mr-4" size={20} />
          <h2 className="text-lg font-semibold mb-0">스터디 일정</h2>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
            {isFinished ? (
              <Typography color="error" variant="h4" align="right">
                마감
              </Typography>
            ) : (
              <Button 
                variant="contained" 
                color="error" 
                onClick={() => handleFinishStudy()}
              >
                마감
              </Button>
            )}
          </Box>
        </Card.Header>

        <Card.Body className="p-4">
              {/* 요일 선택 섹션 - 웹 버전 */}
              <div className="hidden md:flex justify-content-between mb-4">
                {['월', '화', '수', '목', '금', '토', '일'].map((day, index) => (
                  <div
                    key={index}
                    className={`w-8 h-8 d-flex align-items-center justify-content-center 
                      ${studyScheduleDetail.weekDay.includes(day) 
                      ? 'rounded-circle bg-primary text-white' : ''}`}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* 요일 선택 섹션 - 모바일 버전 */}
              <div className="md:hidden mb-4">
                <div className="grid grid-cols-7 gap-2">
                  {['월', '화', '수', '목', '금', '토', '일'].map((day, index) => (
                    <div
                      key={index}
                      className={`aspect-square flex items-center justify-center text-sm
                        ${studyScheduleDetail.weekDay.includes(day)
                        ? 'rounded-full bg-primary text-white'
                        : 'rounded-full border border-gray-200'}`}
                    >
                      {day}
                    </div>
                  ))}
                </div>
              </div>

              {/* 스케줄 정보 섹션 - 웹 버전 */}
              <div className="hidden md:block space-y-2">
                <div className="d-flex justify-content-between">
                  <span className="text-primary">시작일</span>
                  <span>{studyScheduleDetail.startDay}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>시간</span>
                  <span>{studyScheduleDetail.time}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>모집 인원</span>
                  <span>{studyScheduleDetail.nowPeople}/{studyScheduleDetail.recruitPeople}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>마감일</span>
                  <span>{studyScheduleDetail.endDay}</span>
                </div>
              </div>

              {/* 스케줄 정보 섹션 - 모바일 버전 */}
              <div className="md:hidden mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-primary mb-1">시작일</div>
                    <div className="font-medium">{studyScheduleDetail.startDay}</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm mb-1">시간</div>
                    <div className="font-medium">{studyScheduleDetail.time}</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm mb-1">모집 인원</div>
                    <div className="font-medium">
                      {studyScheduleDetail.nowPeople}/{studyScheduleDetail.recruitPeople}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm mb-1">마감일</div>
                    <div className="font-medium">{studyScheduleDetail.endDay}</div>
                  </div>
                </div>
              </div>
            </Card.Body>
    </Card>
  );
};

export default StudySchedule;