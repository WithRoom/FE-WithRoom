import React from 'react';
import { Background, LoadingText } from './Style.js';
const Loading = () => {
  return (
    <Background>
      <LoadingText>잠시만 기다려 주세요.</LoadingText>
      <img src='/spinner.gif' alt="로딩중" width="5%" />
    </Background>
  );
};

export default Loading;