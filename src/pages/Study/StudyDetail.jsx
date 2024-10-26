import React, { useState, useEffect, useContext } from 'react';
import { 
  Container, Box, Grid, Card, CardContent, CardMedia, 
  Typography, TextField, Button, Chip, Avatar,
  List, ListItem, ListItemText, ListItemAvatar,
  Divider, IconButton, Paper, FormControlLabel, Checkbox
} from '@mui/material';
import { 
  Book as BookIcon, 
  EmojiEvents as TrophyIcon, 
  LocalOffer as TagIcon,
  Send as SendIcon,
  Delete as DeleteIcon,
  Cancel as CancleIcon
} from '@mui/icons-material';
import axios from 'axios';
import Swal from 'sweetalert2';
import DOMPurify from 'dompurify';
import { StudyContext } from './StudyContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import StudySchedule from './StudySchedule';
import Skeleton from 'react-loading-skeleton';
import {useNavigate } from "react-router-dom";
import '../css/Study.css';
import { format } from 'date-fns'; 

const StyledCard = ({ children, ...props }) => (
  <Card
    {...props}
    sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: 3,
      borderRadius: 2,
      ...props.sx
    }}
  >
    {children}
  </Card>
);

const StudyDetail = () => {
  const { studyId } = useContext(StudyContext);
  const [studyDetail, setStudyDetail] = useState(null);
  const [studyGroupLeader, setStudyGroupLeader] = useState(null);
  const [studyScheduleDetail, setStudyScheduleDetail] = useState(null);
  const [studyCommentList, setStudyCommentList] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isFinished, setIsFinished] = useState(false);
  const [anonymous, setAnonymous] = useState(false);
  const [isDeleted,setIstDeleted] = useState(false);

  const navigate = useNavigate();

  const api = axios.create({
    baseURL: process.env.REACT_APP_DOMAIN, 
  });

  useEffect(() => {
    const fetchStudyDetail = async () => {
      if (!studyId) {
        console.error('No studyId found in context');
        return;
      }

      try {
        const response = await api.post(process.env.REACT_APP_DOMAIN + '/study/info/detail', { studyId }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        });
        setStudyDetail(response.data.studyDetail);
        setStudyGroupLeader(response.data.studyGroupLeader);
        setStudyScheduleDetail(response.data.studyScheduleDetail);
        setStudyCommentList(response.data.studyCommentList);
      } catch (error) {
        console.error('Error fetching study detail:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error fetching study detail',
          text: error.message,
        });
      }
    };

    fetchStudyDetail();
  }, [studyId]);

  const handleDeleteStudy = async () => {
    try {
      const result = await Swal.fire({
        title: '스터디 삭제',
        text: '정말로 이 스터디를 삭제하시겠습니까?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButton: 'btn waves-effect waves-light btn-outline-primary btn-white font-weight-bold mr-2',
        confirmButtonText: '삭제',
        cancelButtonText: '취소',
        background : '#b998f5',
        background: '#333', 
        color: '#fff', 
        confirmButton: 'btn waves-effect waves-light btn-outline-primary btn-white font-weight-bold mr-2',
        customClass: {
          popup: 'dark-popup',
          title: 'dark-title',
          htmlContainer: 'dark-text',
          confirmButton: 'dark-confirm',
          cancelButton: 'dark-cancel',
        },
      });
  
      if (result.isConfirmed) {
        const response = await api.post(process.env.REACT_APP_DOMAIN + '/study/delete', { studyId }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        });
  
        if (response.data === true) {
          Swal.fire({
            icon: 'success',
            title: '스터디가 삭제되었습니다.',
          });
          setIstDeleted(true);
          navigate('/home');
        } else {
          Swal.fire({
            icon: 'error',
            title: '스터디 삭제 실패! 다시 시도해주세요.',
          });
          setIstDeleted(false);
        }
      }
    } catch (error) {
      console.error('Error deleting study:', error);
      Swal.fire({
        icon: 'error',
        title: '스터디 삭제 중 오류가 발생했습니다. 시스템에 문의해주세요.',
        text: error.message,
      });
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      Swal.fire({
        icon: 'error',
        title: '댓글을 입력해주세요.',
      });
      return;
    }
  
    try {
      await api.post(process.env.REACT_APP_DOMAIN + '/comment/create', {
        studyId,
        content: newComment,
        anonymous,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
  
      Swal.fire({
        icon: 'success',
        title: '댓글이 추가되었습니다.',
      });
  
      const detailResponse = await api.post('/study/info/detail', { studyId }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
  
      setStudyCommentList(detailResponse.data.studyCommentList);
      setNewComment('');
    } catch (error) {
      console.error('Error creating comment:', error);
      Swal.fire({
        icon: 'error',
        title: '댓글 추가에 실패했습니다.',
        text: error.message,
      });
    }
  };

  const handleDeleteComment = async (commentId) => {
    const api = axios.create({
      baseURL: process.env.REACT_APP_DOMAIN, 
    });
  
    try {
      const result = await Swal.fire({
        title: '댓글 삭제',
        text: '삭제하시겠습니까?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: '삭제',
        cancelButtonText: '취소',
        background: '#333', 
        color: '#fff', 
        customClass: {
          popup: 'dark-popup',
          title: 'dark-title',
          htmlContainer: 'dark-text',
          confirmButton: 'dark-confirm',
          cancelButton: 'dark-cancel',
        },
      });
  
      if (result.isConfirmed) {
        const response = await api.post(process.env.REACT_APP_DOMAIN + '/comment/delete', { commentId }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        });
        if (response.data === true) {
          Swal.fire({
            icon: 'success',
            title: '댓글이 삭제되었습니다.',
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: '댓글 삭제 실패! 다시 시도해주세요.',
          });
        }
      }
  
      const detailResponse = await api.post('/study/info/detail', { studyId }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
  
      setStudyCommentList(detailResponse.data.studyCommentList);
    } catch (error) {
      console.error('Error deleting comment:', error);
      Swal.fire({
        icon: 'error',
        title: '댓글 삭제에 실패했습니다.',
        text: error.message,
      });
    }
  };

  if (!studyDetail || !studyGroupLeader || !studyScheduleDetail) {
    return (
      <Container>
        <Header />
        <Box sx={{ my: 4 }}>
          <Grid container spacing={4}>
            <Grid item md={8}>
              <Skeleton height={200} />
              <Skeleton count={5} />
            </Grid>
            <Grid item md={4}>
              <Skeleton height={300} />
            </Grid>
          </Grid>
        </Box>
        <Footer />
      </Container>
    );
  }

  const sanitizedIntroduction = DOMPurify.sanitize(studyDetail.introduction.replace(/<\/?p>/g, ''));

  return (
    <Container>
      <Header />
      <Box sx={{ my: 3 }}>
        <Grid container spacing={6}>
        <Grid item xs={12} md={9}>
            <StyledCard>
              <CardContent>
              <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteStudy(studyDetail.studyId)}>
                            <DeleteIcon />
            </IconButton>
                <Typography variant="h4" component="h1" gutterBottom align="center">
                  {studyDetail.title}
                </Typography>
                
                <Typography variant="body1" paragraph>
                  <div dangerouslySetInnerHTML={{ __html: sanitizedIntroduction }} />
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BookIcon color="primary" />
                    <Typography><strong>주제:</strong> {studyDetail.topic}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrophyIcon color="primary" />
                    <Typography><strong>난이도:</strong> {studyDetail.difficulty}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TagIcon color="primary" />
                    <Typography component="span"><strong>태그:</strong></Typography>
                    <Chip label={studyDetail.tag} variant="outlined" size="small" />
                  </Box>
                </Box>

                <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
                  <Typography variant="h6" gutterBottom>그룹장 정보</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar>{studyGroupLeader.name[0]}</Avatar>
                    <Box>
                      <Typography><strong>이름:</strong> {studyGroupLeader.name}</Typography>
                      <Typography><strong>선호 지역:</strong> {studyGroupLeader.preferredArea}</Typography>
                    </Box>
                  </Box>
                </Paper>

                <Box>
                    <Typography variant="h6" gutterBottom>
                      댓글 {studyCommentList.length}
                    </Typography>
                    <List>
                      {studyCommentList.map((comment, index) => (
                        <React.Fragment key={index}>
                          <ListItem alignItems="flex-start">
                            <ListItemAvatar>
                              {comment.anonymous ? <Avatar>익명</Avatar> : (
                                <Avatar>{comment.nickName[0]}</Avatar> 
                              )}
                            </ListItemAvatar>
                            <ListItemText
                              primary={comment.anonymous ? '익명' : comment.nickName} 
                              secondary={
                                <>
                                  {comment.content}
                                  <Typography variant="caption" color="text.secondary" display="block">
                                    {format(new Date(comment.commentDateTime), 'yyyy-MM-dd HH:mm')} {/* Format date */}
                                  </Typography>
                                </>
                              }
                            />
                            <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteComment(comment.commentId)}>
                              <DeleteIcon />
                            </IconButton>
                          </ListItem>
                          {index < studyCommentList.length - 1 && <Divider variant="inset" component="li" />}
                        </React.Fragment>
                      ))}
                    </List>

                    <Box component="form" onSubmit={handleCommentSubmit} sx={{ mt: 2 }}>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="댓글을 입력하세요"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        variant="outlined"
                        inputProps={{ maxLength: 300 }}
                        sx={{ mb: 1 }}
                      />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="caption" color="text.secondary" sx={{ mr: 2 }}>
                            {newComment.length}/300
                          </Typography>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={anonymous}
                                onChange={(e) => setAnonymous(e.target.checked)}
                                size="small"
                              />
                            }
                            label="비밀댓글"
                          />
                        </Box>
                        <Button
                          type="submit"
                          variant="contained"
                          endIcon={<SendIcon />}
                          disabled={!newComment.trim()}
                        >
                          댓글 등록
                        </Button>
                      </Box>
                    </Box>
                  </Box>
              </CardContent>
            </StyledCard>
          </Grid>

          <Grid item xs={12} md={3}>
            <StudySchedule studyScheduleDetail={studyScheduleDetail} studyId={studyDetail.studyId} />
          </Grid>
        </Grid>
      </Box>
      <Footer />
    </Container>
  );
};

export default StudyDetail;