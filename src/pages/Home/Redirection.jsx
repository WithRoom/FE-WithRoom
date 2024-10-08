import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';

const Redirection = () => {
    const api = axios.create({
        baseURL: process.env.REACT_APP_DOMAIN, 
    });

    const domain = process.env.REACT_APP_DOMAIN; // domain 변수 추출
    const code = new URLSearchParams(window.location.search).get('code');
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true; 

        const loginUser = async () => {
            console.log('code:', code);

            try {
                const result = await api.post(`${domain}/oauth/kakao/login`, { code });
                const { accessToken, expiresIn } = result.data;

                if (isMounted) {
                    localStorage.setItem('accessToken', accessToken);
                    localStorage.setItem('tokenExpiration', Date.now() + expiresIn * 1000);

                    if (result.data.firstJoin) {
                        Swal.fire({
                            icon: 'success',
                            title: '어서오세요!',
                            text: '로그인에 성공하였습니다. 회원가입을 완료해주세요.',
                        });
                        navigate('/register');
                    } else {
                        Swal.fire({
                            icon: 'success',
                            title: '환영합니다!',
                            text: '로그인에 성공하였습니다. 스터디 찾으러 떠나볼까요?',
                        });
                        navigate('/home');
                    }
                }
            } catch (error) {
                console.error("Error during login:", error);
                handleLoginError(error, isMounted);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        const refreshToken = async () => {
            try {
                const accessToken = localStorage.getItem('accessToken');
                const expireTime = localStorage.getItem('tokenExpiration');

                const response = await api.post(`${domain}/oauth/kakao/reissue`, {
                    grantType: 'Bearer',
                    accessToken: accessToken,
                    expireTime: expireTime,
                });
                
                if (isMounted) {
                    const newAccessToken = response.data.accessToken;
                    localStorage.setItem('accessToken', newAccessToken);
                    localStorage.setItem('tokenExpiration', Date.now() + response.data.expiresIn * 1000);
                    return newAccessToken;
                }
            } catch (error) {
                console.error("Error refreshing token:", error);
                if (isMounted) {
                    Swal.fire({
                        icon: 'error',
                        title: '토큰 갱신 실패',
                        text: '다시 로그인해주세요!',
                    });
                    navigate('/login');
                }
            }
        };

        const handleLoginError = async (error, isMounted) => {
            if (error.response?.status === 401) { 
                const tokenExpiration = localStorage.getItem('tokenExpiration');

                if (Date.now() > tokenExpiration) {
                    await refreshToken();
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: '로그인에 실패하였습니다.',
                        text: error.response?.data?.message || '다시 시도해주세요!',
                    });
                }
            } else {
                Swal.fire({
                    icon: 'error',
                    title: '로그인에 실패하였습니다.',
                    text: error.response?.data?.message || '다시 시도해주세요!',
                });
            }
        };

        loginUser();

        return () => {
            isMounted = false;
        };
    }, [code, navigate]);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center text-center" style={{ height: "100vh" }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">로그인 중...</span>
                </div>
            </div>
        );
    }

    return null;
};

export default Redirection;
