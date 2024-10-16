import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StudyProvider } from './pages/Study/StudyContext';
import SocialKakao from './pages/Home/SocialKakao';
import Home from './pages/Home/Home';
import Redirection from './pages/Home/Redirection';
import StudyGroupList from './pages/Study/StudyGroupList';
import Register from './pages/Register/Register';
import NotFound from './pages/common/NotFound';
import PrivateRoute from './pages/common/PrivateRoute';
import Me from './pages/Home/Me';
import StudyDetail from './pages/Study/StudyDetail';
import StudyList from './pages/Study/StudyList';
import UpdateProfile from './pages/Home/UpdateProfile';

const App = () => {
  useEffect(() => {
    const onBeforeUnload = (event) => {
      const isReload = sessionStorage.getItem('isReload');
      if (!isReload) {
        sessionStorage.clear(); 
      }
    };
  
    const clearSessionStorageOnLoad = () => {
      sessionStorage.setItem('isReload', 'true');
    };
  
    window.addEventListener('beforeunload', onBeforeUnload);
    window.addEventListener('load', clearSessionStorageOnLoad);
  
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
      window.removeEventListener('load', clearSessionStorageOnLoad);
    };
  }, []);
  

  return (
    <StudyProvider>
      <div className='App' style={{ backgroundColor: 'white' }}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/home" />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<SocialKakao />} />
            <Route path="/study" element={<PrivateRoute element={StudyGroupList} />} />
            <Route exact path='/kakao/callback' element={<Redirection />} />
            <Route path="/register" element={<Register />} />
            <Route path="/me" element={<PrivateRoute element={Me}/>} />
            <Route path="/study/info/detail" element={<StudyDetail />} />
            <Route path="*" element={<NotFound to="/404" />} />
            <Route path="/study/list" element={<StudyList />} />
            <Route path="/update/profile" element={<UpdateProfile />} />
          </Routes>
        </BrowserRouter>
      </div>
    </StudyProvider>
  );
};

export default App;
