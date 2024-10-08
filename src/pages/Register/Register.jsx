import React, { useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import axios from 'axios';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Box,
  Snackbar
} from '@mui/material';
import SelectComponent from './SelectComponent';
import SelectInterestComponent from './SelectInterestComponent';

export default function Register() {

  
  const location = useLocation();
  const navigate = useNavigate();
  const { combinedString = "", selectedInterest = "" } = location.state || {};

  const [formState, setFormState] = useState({
    nickName: '',
    preferredArea: combinedString,
    interest: selectedInterest,
    areaSelections: {
      category: '',
      city: '',
      district: '',
      town: ''
    }
  });
  
  const [status, setStatus] = useState({
    loading: false,
    error: '',
    success: false
  });

  const handleInputChange = (name, value) => {
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAreaChange = (type, value) => {
    setFormState(prev => {
      const newAreaSelections = { 
        ...prev.areaSelections, 
        [type]: value 
      };
      
      const concatenatedArea = Object.values(newAreaSelections)
        .filter(Boolean)
        .join(' ');

      return {
        ...prev,
        areaSelections: newAreaSelections,
        preferredArea: concatenatedArea
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: '', success: false });
    
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setStatus({
        loading: false,
        error: '로그인이 필요합니다.',
        success: false
      });
      return;
    }

    try {
      await saveUser('/member/create/info', {
        nickName: formState.nickName,
        preferredArea: formState.preferredArea,
        interest: formState.interest
      }, token);
      
      setStatus({ loading: false, error: '', success: true });
      setTimeout(() => navigate('/home'), 2000);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setStatus({
        loading: false,
        error: errorMessage,
        success: false
      });
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            추가 정보 입력
          </Typography>
          <Typography variant="body1" color="text.secondary">
            회원가입을 완료하기 위해 추가 정보를 입력해주세요.
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="닉네임"
            variant="outlined"
            value={formState.nickName}
            onChange={(e) => handleInputChange('nickName', e.target.value)}
            required
            sx={{ mb: 3 }}
          />

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              선호 지역
            </Typography>
            <SelectComponent 
              onCategoryChange={(value) => handleAreaChange('category', value)}
              onCityChange={(value) => handleAreaChange('city', value)}
              onDistrictChange={(value) => handleAreaChange('district', value)}
              onTownChange={(value) => handleAreaChange('town', value)}
            />
            {formState.preferredArea && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                입력한 선호 지역: {formState.preferredArea}
              </Typography>
            )}
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              관심사
            </Typography>
            <SelectInterestComponent 
              onChange={(value) => handleInputChange('interest', value)}
            />
          </Box>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={status.loading}
            sx={{ height: 56 }}
          >
            {status.loading ? (
              <CircularProgress size={24} />
            ) : "등록하기"}
          </Button>
        </form>
      </Paper>

      <Snackbar 
        open={Boolean(status.error)} 
        autoHideDuration={6000} 
        onClose={() => setStatus(prev => ({ ...prev, error: '' }))}
      >
        <Alert severity="error" variant="filled">
          {status.error}
        </Alert>
      </Snackbar>

      <Snackbar 
        open={status.success} 
        autoHideDuration={2000}
      >
        <Alert severity="success" variant="filled">
          회원가입이 완료되었습니다. 홈으로 이동합니다.
        </Alert>
      </Snackbar>
    </Container>
  );
}

function getErrorMessage(error) {
  if (!error.response) {
    return '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.';
  }

  switch (error.response.status) {
    case 404:
      return '경로를 찾을 수 없습니다. URL을 확인해주세요.';
    case 401:
      return '인증에 실패했습니다. 다시 로그인해주세요.';
    default:
      return '회원가입에 실패했습니다. 잠시 후 다시 시도해주세요.';
  }
}

async function saveUser(url, json, token) {
  const api = axios.create({
    baseURL: process.env.REACT_APP_DOMAIN, 
  });

  const response = await api.post(url, json, {
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
}