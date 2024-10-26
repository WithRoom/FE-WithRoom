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
    const fetchStudyInfo = async () => {
      try {
        const response = await axios.get(`/home/filter/info`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
        });

        console.log('Fetched study info:', response);
        const studyInfoList = response.data.homeStudyInfoList;
        setHomeStudyInfoList(studyInfoList);

        const currentStudy = studyInfoList.find((study) => study.studyId === studyId);

        console.log('Current study:', currentStudy);

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
      <Card.Header className="bg-gray-200 py-2 d-flex align-items-center" style={{ borderBottom: "solid" }}>
        <Calendar className="mr-2" size={20} />
        <h2 className="text-lg font-semibold mb-0">스터디 일정</h2>
      </Card.Header>

      <Card.Body className="p-4">
        <div className="d-flex justify-content-between mb-4">
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
        <div className="space-y-2">
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
      </Card.Body>
    </Card>
  );
};

export default StudySchedule;