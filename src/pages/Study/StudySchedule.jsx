import React, { useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { Card } from 'react-bootstrap';
import Swal from 'sweetalert2';

const StudySchedule = ({ studyScheduleDetail }) => {
  console.log('studyScheduleDetail',studyScheduleDetail);

  useEffect(() => {
    const currentDate = new Date().toISOString().split('T')[0];
    if (currentDate > studyScheduleDetail.endDay) {
      Swal.fire({
        icon: 'warning',
        title: '마감된 스터디입니다',
        showConfirmButton: true,
      });
    }
  }, [studyScheduleDetail.endDay]);

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