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


import React, { useState } from "react";
import { Button } from "react-bootstrap";
import { Heart } from "lucide-react";
import axios from "axios";
import Swal from "sweetalert2";
import BeatLoader from "react-spinners/BeatLoader";

const LikeButton = ({ isLiked, setIsLiked, studyId }) => {
  const [loading, setLoading] = useState(false);

  const api = axios.create({
    baseURL: process.env.REACT_APP_DOMAIN,
  });

  const handleLikeClick = () => {
    setLoading(true); // 로딩 상태 시작

    api
      .get("/study/mypage/info/mystudy", {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      })
      .then((response) => {
        const groupLeaderStudies = response.data.groupLeaderStudies;
        const isGroupLeader = groupLeaderStudies.some((study) => study.studyId === studyId);

        if (isGroupLeader) {
          Swal.fire({
            icon: "error",
            title: "관심 생성 실패",
            text: "스터디 그룹장은 관심 추가할 수 없습니다.",
          });
          setLoading(false); // 로딩 상태 종료
          return; // 그룹장일 경우 관심 생성 중단
        }

        // 그룹장이 아닐 경우 관심 등록/취소 로직 진행
        api
          .post("/study/interest", { studyId }, {
            headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
          })
          .then((response) => {
            if (response.data === true) {
              if (isLiked) {
                Swal.fire({
                  icon: "success",
                  title: "관심이 취소되었습니다.",
                  showConfirmButton: false,
                  timer: 1500,
                });
                setIsLiked(false);
              } else {
                Swal.fire({
                  icon: "success",
                  title: "관심이 등록되었습니다.",
                  showConfirmButton: false,
                  timer: 1500,
                });
                setIsLiked(true);
              }
            }
            setLoading(false); // 로딩 상태 종료
          })
          .catch((error) => {
            console.error("Error during interest request:", error);
            Swal.fire({
              icon: "error",
              title: "관심 등록에 실패했습니다.",
              text: error.response ? error.response.data : "Unknown error",
            });
            setLoading(false); // 로딩 상태 종료
          });
      })
      .catch((error) => {
        console.error("Error during get my study:", error);
        setLoading(false); // 로딩 상태 종료
      });
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
    setLoading(true)
    try {
      const response = await api.post(process.env.REACT_APP_DOMAIN + '/study/join', { studyId },
        { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });

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

    } catch (error) {
      console.error('Error joining study:', error);
    } finally {
      setLoading(false); // End loading
    }
  };

  return (
    <Button
      variant="outline-primary"
      size="sm"
      onClick={state ? studyJoin : null}
      disabled={!state}
    >
      {state ? "참여하기" : "마감됨"}
    </Button>
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


      Swal.fire({
        icon: 'success',
        title: '스터디 참여 요청 수락',
        showConfirmButton: false,
        timer: 1500
      });
      if (onAccept) onAccept();

      window.location.reload();
    } catch (error) {
      console.error('Error accepting study join request:', error);
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
      style={{ position: 'relative', width: '18rem', transition: 'transform 0.2s', transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className="mb-3" style={{ width: '100%', borderRadius: '15px', border: '1px solid lightgray' }}>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-start">
            <Card.Title>{study.title}</Card.Title>
            <LikeButton isLiked={isLiked} setIsLiked={setIsLiked} studyId={study.studyId} />
          </div>
          <div onClick={handleCardClick} style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>
            <StudyImage src={study.studyImageUrl} />
          </div>
          <Tags tags={study.topic} />
          <Difficulty difficulty={study.difficulty} />
          <OnlineStatus type={study.type} />
          <div className="d-flex justify-content-between align-items-center">
            <RecruitmentInfo nowPeople={study.nowPeople} recruitPeople={study.recruitPeople} />
            {cardType === 'request-join' ? (
              <>
                <ApplicantModal nickName={study.nickName} preferredArea={study.preferredArea}/>
                <AcceptRejectButtons 
                  studyId={study.studyId} 
                  memberId={study.memberId}
                  onAccept={() => {navigate('/me');
                  }}
                  onReject={() => {navigate('/me');
                  }}
                />
              </>
            ) : (
              <ActionButton state={study.state} studyId={study.studyId} />
            )}
          </div>
        </Card.Body>
      </Card>
      {isClosed && (
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: '15px',
            zIndex: 10
          }}
        >
          <XCircle size={64} color="white" />
        </div>
      )}
    </div>
  );
};

export default StudyCard;