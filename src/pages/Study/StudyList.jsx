import React, { useState, useEffect } from 'react';
import { Container, Grid, Pagination as MuiPagination, Card, CardContent, Typography } from '@mui/material';
import axios from 'axios';
import StudyCard from './StudyCard';
import Header from '../components/Header';
import StudySearchFilter from './StudySearchFilter';
import noSearchImg from '../../images/nosearch.png';
import { useLocation } from 'react-router-dom';
import { set } from 'date-fns';

const StudyList = () => {
  const location = useLocation();
  
  const api = axios.create({
    baseURL: process.env.REACT_APP_DOMAIN, 
  });

  const initialStudies = location.state?.homeStudyInfoList || [];
  const [allStudies, setAllStudies] = useState(initialStudies);
  const [currentPage, setCurrentPage] = useState(1);

  const studiesPerPage = 8;

  useEffect(() => {
    if (initialStudies.length === 0 && allStudies.length === 0) {
      fetchAllStudies();
    } else {
      setAllStudies(initialStudies);
    }
  }, []);

  const fetchAllStudies = async () => {
    try {
      const response = await api.get('/home/info', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      setAllStudies(response.data.homeStudyInfoList);
      return;
    } catch (error) {
      console.error('Error fetching studies:', error);
    }
  };

  // Update studies list with search results
  const updateStudies = (filteredStudies) => {
    setAllStudies(filteredStudies);
    setCurrentPage(1); // Reset to first page on search update
  };

  const indexOfLastStudy = currentPage * studiesPerPage;
  const indexOfFirstStudy = indexOfLastStudy - studiesPerPage;
  const currentStudies = allStudies.slice(indexOfFirstStudy, indexOfLastStudy);

  const handlePageChange = (event, pageNumber) => setCurrentPage(pageNumber);

  const totalPages = Math.ceil(allStudies.length / studiesPerPage);

  return (
    <Container>
      <Header />
      <Card>
        <CardContent>
          <StudySearchFilter updateStudies={updateStudies} />
        </CardContent>
      </Card>
      {currentStudies.length > 0 ? (

          <div className="mt-4 w-full">
            {/* Mobile Slider */}
            <div className="md:hidden w-full overflow-x-auto">
              <div className="flex gap-4 p-4 w-full snap-x snap-mandatory">
                {currentStudies.map((study) => (
                  <div 
                    key={study.studyId} 
                    className="flex-none w-[85vw] snap-center"
                  >
                    <StudyCard study={study} />
                  </div>
                ))}
              </div>
          </div>

          {/* Desktop/Tablet Grid */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 px-4">
                {currentStudies.map((study) => (
                  <div key={study.studyId}>
                    <StudyCard study={study} />
                  </div>
                ))}
            </div>
          </div>
          ) : (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '70vh', width: '100%' }}>
              <div className="text-center">
                <img src={noSearchImg} alt="noSearchImg" style={{ width: '300px', height: 'auto', marginBottom: '20px' }} />
                <Typography variant="h6">No studies found</Typography>
              </div>
            </div>
      )}
      <Grid container justifyContent="center" className="mt-4">
        <MuiPagination
          count={totalPages}
          page={currentPage}
          onChange={handlePageChange}
          variant="outlined"
          shape="rounded"
        />
      </Grid>
    </Container>
  );
};

export default StudyList;
