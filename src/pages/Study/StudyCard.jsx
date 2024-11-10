import React, { useState, useContext } from 'react';
import { Card, Button, Modal } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Users, XCircle } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { StudyContext } from './StudyContext';
import BeatLoader from 'react-spinners/BeatLoader';

function ApplicantModal({ nickName, preferredArea }) {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
       <Button variant="primary" size="sm" onClick={handleShow}>
        신청자 목록
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>신청자 목록</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Card>
            <Card.Title>신청자 정보</Card.Title>
            <Card.Text>
              <strong>닉네임:</strong> {nickName}
            </Card.Text>
            <Card.Text>
              <strong>선호 지역:</strong> {preferredArea}
            </Card.Text>
          </Card>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            닫기
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

const LikeButton = ({ isLiked, setIsLiked, studyId }) => {
  const [loading, setLoading] = useState(false);

  const api = axios.create({
    baseURL: process.env.REACT_APP_DOMAIN,
  });

  const handleLikeClick = async () => {
    setLoading(true); 

    try {
      const response = await api.get("/study/mypage/info/mystudy", {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });

      const groupLeaderStudies = response.data.groupLeaderStudies;
      const isGroupLeader = groupLeaderStudies.some((study) => study.studyId === studyId);

      if (isGroupLeader) {
        Swal.fire({
          icon: "error",
          title: "관심 생성 실패",
          text: "스터디 그룹장은 관심 추가할 수 없습니다.",
        });
        setLoading(false);
        return;
      }

      if (isLiked === false) {
        const result = await Swal.fire({
          title: '관심 추가',
          text: '관심을 추가하시겠습니까?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: '확인',
          cancelButtonText: '취소',
          confirmButtonColor: '#9da503',
          cancelButtonColor: '#d33'
        });  
        if (result.isConfirmed) {
          await api.post("/study/interest", { studyId }, {
            headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
          });
  
          Swal.fire({
            icon: "success",
            title: "관심이 등록되었습니다.",
            showConfirmButton: false,
            timer: 1500,
          });
  
          setIsLiked(true);
        }
      } else {
        const result = await Swal.fire({
          title: '관심 취소',
          text: '관심을 취소하시겠습니까?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: '확인',
          cancelButtonText: '취소',
          confirmButtonColor: '#9da503',
          cancelButtonColor: '#d33'
        });  
        if (result.isConfirmed) {
          await api.post("/study/interest", { studyId }, {
            headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
          });
  
          Swal.fire({
            icon: "error",
            title: "관심이 취소되었습니다.",
            showConfirmButton: false,
            timer: 1500,
          });
  
          setIsLiked(false);
        }
      }
    } catch (error) {
      console.error("Error during get my study:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="link" className="p-0" onClick={handleLikeClick} disabled={loading}>
      {loading ? (
        <BeatLoader color="#9da503" loading={loading} size={10} />
      ) : (
        <Heart fill={isLiked ? "red" : "none"} color={isLiked ? "red" : "black"} />
      )}
    </Button>
  );
};


const StudyImage = ({ src }) => (
  <Card.Img
    variant="top"
    src={src}
    className="my-3"
    style={{ width: '300px', height: '200px', objectFit: 'cover' }} 
  />
);

const Tags = ({ tags }) => {
  if (!tags || tags.length === 0) return null;
  const tagsString = Array.isArray(tags) ? tags.join(',') : tags;
  const tagArray = tagsString.split(',').map(tag => tag.trim());

  return (
    <div className="mb-2">
      {tagArray.map((tag, index) => (
        <span key={index} className="badge bg-secondary me-2">#{tag}</span>
      ))}
    </div>
  );
};

const Difficulty = ({ difficulty }) => (
  <div className="mb-2">
    <span className="badge bg-info">{difficulty}</span>
  </div>
);

const OnlineStatus = ({ type }) => (
  <div className="mb-2">
    <span className="text-muted">{type === 'online' ? '온라인' : '오프라인'}</span>
  </div>
);

const RecruitmentInfo = ({ nowPeople, recruitPeople }) => (
  <div>
    <Users size={18} className="me-1" />
    {nowPeople === recruitPeople ? (
      <span className="badge bg-danger">마감됨</span>
    ) : (
      `${nowPeople}/${recruitPeople}`
    )}
  </div>
);

const ActionButton = ({ state, studyId }) => {
  const [loading, setLoading] = useState(false);

  const api = axios.create({
    baseURL: process.env.REACT_APP_DOMAIN,
  });

  const studyJoin = async () => {
    try {
      const result = await Swal.fire({
        title: '스터디 신청',
        text: '해당 스터디를 신청하시겠습니까?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: '확인',
        cancelButtonText: '취소',
        confirmButtonColor: '#9da503',
        cancelButtonColor: '#d33'
      });

      if (result.isConfirmed) {
        setLoading(true);
        const response = await api.post('/study/join', { studyId }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        });

        setLoading(false); // 로딩 종료

        if (response.data === false) {
          Swal.fire({
            icon: 'error',
            title: '스터디 신청 실패',
            text: '그룹장이거나 이미 신청한 스터디입니다. 그룹장은 스터디에 참여할 수 없습니다.',
          });
        } else {
          Swal.fire({
            icon: 'success',
            title: '스터디 신청 완료',
            showConfirmButton: false,
            timer: 1500
          });
        }
      }
    } catch (error) {
      console.error('Error joining study:', error);
    } finally {
      setLoading(false); // End loading
    }
  };

  return (
    <div>
    <Button variant="outline-primary" size="sm" onClick={state ? studyJoin : null} disabled={!state || loading}>
      {loading ? (
        <BeatLoader color="#9da503" loading={loading} size={10} />
      ) : (
        "참여하기"
      )}
    </Button>
  </div>
  );
};

const AcceptRejectButtons = ({ studyId, memberId, onAccept, onReject }) => {
  const api = axios.create({
    baseURL: process.env.REACT_APP_DOMAIN, 
  });


  const handleAccept = async () => {
    try {
      await api.post(process.env.REACT_APP_DOMAIN + '/study/response-join', { state: true, studyId, memberId },
        { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });

      const result = await Swal.fire({
        title: '스터디 요청 수락',
        text: '해당 스터디의 신청자를 수락 하시겠습니까?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: '확인',
        cancelButtonText: '취소',
        confirmButtonColor: '#9da503',
        cancelButtonColor: '#d33'
      });  

      if(result.isConfirmed) {
        Swal.fire({
          icon: 'success',
          title: '스터디 참여 요청 수락',
          showConfirmButton: false,
          timer: 1500
        });
        if (onAccept) onAccept();
  
        window.location.reload();
        } 
      }catch (error) {
          Swal.fire({
            icon: 'error',
            title: '스터디 참여 요청 수락 실패',
            text: '오류가 발생했습니다. 다시 시도해주세요.',
        });
      }
  };

  const handleReject = async () => {
    const api = axios.create({
      baseURL: process.env.REACT_APP_DOMAIN, 
    });

    try {
      await api.post(process.env.REACT_APP_DOMAIN + '/study/response-join', { state: false, studyId, memberId },
        { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      Swal.fire({
        icon: 'success',
        title: '스터디 참여 요청을 거절',
        showConfirmButton: false,
        timer: 1500
      });
      if (onReject) onReject();
    } catch (error) {
      console.error('Error rejecting study join request:', error);
      Swal.fire({
        icon: 'error',
        title: '스터디 참여 요청 거절 실패',
        text: '오류가 발생했습니다. 다시 시도해주세요.',
      });
    }
  };

  return (
    <div>
      <Button variant="success" size="sm" onClick={handleAccept} className="me-2">
        수락
      </Button>
      <Button variant="danger" size="sm" onClick={handleReject}>
        거절
      </Button>
    </div>
  );
};


const StudyCard = ({ study, cardType }) => {
  const [isLiked, setIsLiked] = useState(study.interest);
  const { setStudyId } = useContext(StudyContext);
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const handleCardClick = () => {
    setStudyId(study.studyId);
    navigate('/study/info/detail');
  };

  const isClosed = study.nowPeople === study.recruitPeople;

  return (

    <div 
      className={`relative w-full md:w-72 transition-transform duration-200 ${
        isHovered ? 'md:scale-105' : 'scale-100'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className="w-full border rounded-xl border-gray-200 mb-3">
        <div className="p-4">
          {/* Header Section */}
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-lg font-semibold truncate pr-2 m-0">
              {study.title}
            </h3>
            <div className="flex-shrink-0">
              <LikeButton 
                isLiked={isLiked} 
                setIsLiked={setIsLiked} 
                studyId={study.studyId}
              />
            </div>
          </div>

          {/* Image Section */}
          <div 
            onClick={handleCardClick}
            className="cursor-pointer mb-3"
          >
            <StudyImage src={study.studyImageUrl} />
          </div>

          {/* Tags Section - Horizontal scroll on mobile */}
          <div className="flex gap-2 overflow-x-auto mb-2 pb-1 scrollbar-hide">
            <Tags tags={study.topic} />
          </div>

          {/* Info Section */}
          <div className="space-y-2">
            <Difficulty difficulty={study.difficulty} />
            <OnlineStatus type={study.type} />
          </div>

          {/* Bottom Section */}
          <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <RecruitmentInfo 
              nowPeople={study.nowPeople} 
              recruitPeople={study.recruitPeople} 
            />
            
            {cardType === 'request-join' ? (
              <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
                <ApplicantModal 
                  nickName={study.nickName} 
                  preferredArea={study.preferredArea}
                />
                <div className="flex gap-2">
                  <AcceptRejectButtons 
                    studyId={study.studyId}
                    memberId={study.memberId}
                  />
                </div>
              </div>
            ) : (
              <div className="w-full sm:w-auto">
                <ActionButton 
                  state={study.state} 
                  studyId={study.studyId} 
                />
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Closed Overlay */}
      {study.isClosed && (
        <div className="absolute inset-0 bg-black/50 flex justify-center items-center rounded-xl">
          <XCircle className="w-16 h-16 text-white" />
        </div>
      )}
    </div>
  );
};

export default StudyCard;