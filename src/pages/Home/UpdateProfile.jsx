import React, { useState, useEffect } from 'react';
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
import { useFormik } from 'formik';
import * as yup from 'yup';
import SelectComponent from '../Register/SelectComponent';
import SelectInterestComponent from '../Register/SelectInterestComponent';

const validationSchema = yup.object({
  name: yup.string('Enter your name').required('Name is required'),
  nickName: yup.string('Enter your nickname').required('Nickname is required'),
  preferredArea: yup.string('Enter your preferred area').required('Preferred area is required'),
  interest: yup.string('Enter your interest').required('Interest is required')
});

export default function UpdateProfile() {

  const location = useLocation();
  const navigate = useNavigate();
  const { combinedString = "", selectedInterest = "" } = location.state || {};

  const [status, setStatus] = useState({
    loading: false,
    error: '',
    success: false
  });

  const formik = useFormik({
    initialValues: {
      name: '',
      nickName: '',
      preferredArea: combinedString,
      interest: selectedInterest,
      areaSelections: {
        category: '',
        city: '',
        district: '',
        town: ''
      }
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
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
        await saveUser('/member/mypage/update', {
          name: values.name,
          nickName: values.nickName,
          preferredArea: values.preferredArea,
          interest: values.interest
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
    }
  });

  useEffect(() => {
    const fetchData = async () => {
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
        const response = await axios.get('/member/mypage/info', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = response.data;
        formik.setValues({
          name: data.name,
          nickName: data.nickName,
          preferredArea: data.preferredArea,
          interest: data.interest,
          areaSelections: {
            category: '',
            city: '',
            district: '',
            town: ''
          }
        });
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        setStatus({
          loading: false,
          error: errorMessage,
          success: false
        });
      }
    };

    fetchData();
  }, []);

  const handleAreaChange = (type, value) => {
    formik.setValues(prev => {
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

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            추가 정보 입력
          </Typography>
        </Box>

        <form onSubmit={formik.handleSubmit}>
          <TextField
            fullWidth
            label="이름"
            name="name"
            value={formik.values.name}
            onChange={formik.handleChange}
            placeholder={formik.values.name}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
            required
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            label="닉네임"
            name="nickName"
            variant="outlined"
            value={formik.values.nickName}
            onChange={formik.handleChange}
            placeholder={formik.values.nickName}
            error={formik.touched.nickName && Boolean(formik.errors.nickName)}
            helperText={formik.touched.nickName && formik.errors.nickName}
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
            {formik.values.preferredArea && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                입력한 선호 지역: {formik.values.preferredArea}
              </Typography>
            )}
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              관심사
            </Typography>
            <SelectInterestComponent 
              onChange={(value) => formik.setFieldValue('interest', value)}
              placeholder={formik.values.interest}
            />
            {formik.touched.interest && formik.errors.interest && (
              <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                {formik.errors.interest}
              </Typography>
            )}
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
            ) : "수정하기"}
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
          회원 정보 수정이 완료되었습니다. 홈으로 이동합니다.
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
      return '회원 정보 수정에 실패했습니다. 잠시 후 다시 시도해주세요.';
  }
}

async function saveUser(url, json, token) {
  const api = axios.create({
    baseURL: 'https://studywithme.store',
  });

  const response = await api.post(url, json, {
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
}