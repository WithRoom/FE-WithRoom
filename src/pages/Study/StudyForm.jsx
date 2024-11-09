import React, { useState } from 'react';
import {
  Container, Paper, Typography, Stepper, Step, StepLabel, 
  Grid, Box, Button, TextField, FormControl, InputLabel,
  Select, MenuItem, Stack, Chip, RadioGroup, FormControlLabel,
  Radio, useTheme, useMediaQuery
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const steps = ['기본 정보', '일정 설정', '상세 정보'];

export default function StudyForm() {
  const api = axios.create({
    baseURL: process.env.REACT_APP_DOMAIN, 
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    memberCount: '',
    topic: '',
    days: [],
    startDate: '',
    endDate: '',
    duration: '',
    time: '',
    description: '',
    difficulty: '',
    searchTags: '',
    kakaoOpenChatUrl: '',
    image: null,
    imagePreview: null
  });

  const daysOfWeek = ['월', '화', '수', '목', '금', '토', '일'];
  const studyTopics = ['개념학습', '응용/실용', '프로젝트', '챌린지', '자격증/시험', '취업/코테', '특강', '기타'];
  const timeSlots = ['08:00 ~ 10:00', '10:00 ~ 12:00', '12:00 ~ 14:00', '14:00 ~ 16:00', 
                     '16:00 ~ 18:00', '18:00 ~ 20:00', '20:00 ~ 22:00'];
  const periodSlots = ['1주', '1개월', '3개월', '6개월', '1년'];

  const handleChange = (field) => (event) => {
    setFormData({ ...formData, [field]: event.target.value });
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        image: file,
        imagePreview: URL.createObjectURL(file)
      });
    }
  };

  const handleDayToggle = (day) => {
    const newDays = formData.days.includes(day)
      ? formData.days.filter(d => d !== day)
      : [...formData.days, day];
    setFormData({ ...formData, days: newDays });
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    if (!formData.image) {
      Swal.fire({
        icon: 'error',
        title: '이미지를 업로드해주세요!',
      });
      return;
    }

    const token = localStorage.getItem('accessToken');
    const formDataToSubmit = new FormData();
    formDataToSubmit.append('file', formData.image);

    try {
      const response = await api.post(process.env.REACT_APP_DOMAIN + '/image/upload/study', formDataToSubmit, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
      });

      const imageUrl = response.data.imageUrl;

      const finalFormData = {
        studyInfo: {
          studyImageUrl: imageUrl,
          title: formData.title,
          type: formData.type,
          recruitPeople: parseInt(formData.memberCount, 10),
          introduction: formData.description,
          topic: formData.topic,
          difficulty: formData.difficulty,
          tag: formData.searchTags,
          kakaoOpenChatUrl : formData.kakaoOpenChatUrl
        },
        studySchedule: {
          weekDay: formData.days.join(', '),
          startDay: formData.startDate,
          endDay: formData.endDate,
          period: formData.duration,
          time: formData.time,
        },
      };

      const isFormValid = Object.values(finalFormData.studyInfo).every(field => field) &&
      Object.values(finalFormData.studySchedule).every(field => field);

      if (!isFormValid) {
             Swal.fire({
              icon: 'error',
               title: '모든 필드를 채워주세요!',
             });
       return;
      }

      Swal.fire({
        title: "모든 필드를 다 채우셨나요?",
        text: "스터디 생성 후 수정이 불가능합니다.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "생성",
        cancelButtonText: "취소",
      }).then((result) => {
        api.post(process.env.REACT_APP_DOMAIN + '/study/create', finalFormData, {
          headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            'Authorization': `Bearer ${token}`
          }
        }).then(() => {
          Swal.fire({
            icon: 'success',
            title: '스터디 생성 완료!',
            text : '홈으로 이동합니다.'
          });
          navigate('/home');
        }).catch((error) => {
          Swal.fire({
            icon: 'fail',
            title: '스터디 생성 실패'
          });
        });
        
      });
    } catch (error) {
      console.error("Error during form submission:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error during form submission',
        text: error.message,
      });
    }
  };

  const getStepContent = (activeStep) => {
    switch (activeStep) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box sx={{ 
                width: '100%', 
                height: isMobile ? 150 : 200,
                border: '2px dashed #ccc',
                borderRadius: 2,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                mb: 2,
                background: formData.imagePreview ? `url(${formData.imagePreview})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}>
                {!formData.imagePreview && (
                  <Button
                    component="label"
                    variant="contained"
                    startIcon={<CloudUploadIcon />}
                    size={isMobile ? "small" : "medium"}
                  >
                    이미지 업로드
                    <VisuallyHiddenInput type="file" onChange={handleImageChange} />
                  </Button>
                )}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="스터디 제목"
                value={formData.title}
                onChange={handleChange('title')}
                helperText={`${formData.title.length}/50`}
                size={isMobile ? "small" : "medium"}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="카카오 오픈 채팅 URL"
                value={formData.kakaoOpenChatUrl}
                onChange={handleChange('kakaoOpenChatUrl')}
                placeholder='카카오 오픈 채팅 URL을 입력해주세요.'
                size={isMobile ? "small" : "medium"}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>스터디 유형</InputLabel>
                <Select
                  value={formData.type}
                  onChange={handleChange('type')}
                  label="스터디 유형"
                  size={isMobile ? "small" : "medium"}
                >
                  <MenuItem value="offline">오프라인</MenuItem>
                  <MenuItem value="online">온라인</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="모집 인원"
                type="number"
                value={formData.memberCount}
                onChange={handleChange('memberCount')}
                size={isMobile ? "small" : "medium"}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>스터디 주제</InputLabel>
                <Select
                  value={formData.topic}
                  onChange={handleChange('topic')}
                  label="스터디 주제"
                  size={isMobile ? "small" : "medium"}
                >
                  {studyTopics.map((topic) => (
                    <MenuItem key={topic} value={topic}>{topic}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>스터디 요일</Typography>
              <Stack 
                direction={isMobile ? "row" : "row"} 
                spacing={1} 
                sx={{ 
                  flexWrap: 'wrap',
                  gap: 1,
                  '& .MuiChip-root': {
                    margin: isMobile ? '2px' : '4px',
                  }
                }}
              >
                {daysOfWeek.map((day) => (
                  <Chip
                    key={day}
                    label={day}
                    onClick={() => handleDayToggle(day)}
                    color={formData.days.includes(day) ? "primary" : "default"}
                    variant={formData.days.includes(day) ? "filled" : "outlined"}
                    size={isMobile ? "small" : "medium"}
                  />
                ))}
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="시작일"
                type="date"
                value={formData.startDate}
                onChange={handleChange('startDate')}
                InputLabelProps={{ shrink: true }}
                size={isMobile ? "small" : "medium"}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="종료일"
                type="date"
                value={formData.endDate}
                onChange={handleChange('endDate')}
                InputLabelProps={{ shrink: true }}
                size={isMobile ? "small" : "medium"}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>스터디 시간</InputLabel>
                <Select
                  value={formData.time}
                  onChange={handleChange('time')}
                  label="스터디 시간"
                  size={isMobile ? "small" : "medium"}
                >
                  {timeSlots.map((slot) => (
                    <MenuItem key={slot} value={slot}>{slot}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>스터디 기간</InputLabel>
                <Select
                  value={formData.duration}
                  onChange={handleChange('duration')}
                  label="스터디 기간"
                  size={isMobile ? "small" : "medium"}
                >
                  {periodSlots.map((slot) => (
                    <MenuItem key={slot} value={slot}>{slot}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>스터디 소개</Typography>
              <ReactQuill
                value={formData.description}
                onChange={(value) => setFormData({ ...formData, description: value })}
                style={{ 
                  height: isMobile ? '150px' : '200px', 
                  marginBottom: isMobile ? '30px' : '50px' 
                }}
              />
            </Grid>
            <Grid item xs={12} sx={{ pt: 12 }}>
              <FormControl component="fieldset" sx={{ pt: isMobile ? 2 : 0 }}>
              <Typography variant="subtitle1" gutterBottom>난이도</Typography>
                <RadioGroup
                  row
                  value={formData.difficulty}
                  onChange={handleChange('difficulty')}
                >
                  {['초급', '중급', '고급'].map((level) => (
                    <FormControlLabel 
                      key={level} 
                      value={level} 
                      control={<Radio size={isMobile ? "small" : "medium"} />} 
                      label={level} 
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="검색 태그"
                value={formData.searchTags}
                onChange={handleChange('searchTags')}
                helperText="쉼표로 구분하여 최대 5개까지 입력 가능"
                size={isMobile ? "small" : "medium"}
              />
            </Grid>
          </Grid>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="md" sx={{ 
      mt: isMobile ? 2 : 4, 
      mb: isMobile ? 2 : 4,
      px: isMobile ? 1 : 3 
    }}>
      <Paper sx={{ 
        p: isMobile ? 2 : 4,
        borderRadius: isMobile ? 2 : 3 
      }}>
        <Typography 
          variant={isMobile ? "h5" : "h4"} 
          gutterBottom
          sx={{ mb: isMobile ? 2 : 3 }}
        >
          스터디 만들기
        </Typography>
        <Stepper 
          activeStep={activeStep} 
          sx={{ 
            mb: isMobile ? 2 : 4,
            display: isMobile ? 'none' : 'flex' // 모바일에서는 Stepper 숨기기
          }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {isMobile && (
          <Typography 
            variant="subtitle1" 
            sx={{ mb: 2, color: 'text.secondary' }}
          >
            Step {activeStep + 1} of {steps.length}: {steps[activeStep]}
          </Typography>
        )}

        {getStepContent(activeStep)}

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          mt: isMobile ? 2 : 3,
          pt: 2,
          borderTop: '1px solid',
          borderColor: 'divider'
        }}>
          {activeStep !== 0 && (
            <Button 
              onClick={handleBack}
              size={isMobile ? "small" : "medium"}
            >
              이전
            </Button>
          )}
          <Button
            variant="contained"
            onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
            size={isMobile ? "small" : "medium"}
            sx={{ ml: 'auto' }}
          >
            {activeStep === steps.length - 1 ? '제출하기' : '다음'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}