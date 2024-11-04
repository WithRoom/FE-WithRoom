import React, { useState } from 'react';
import { Container, Grid, Button, CircularProgress, Typography } from '@mui/material';
import { ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';
import styled from '@emotion/styled';

const FilterContainer = styled(Container)`
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: max-height 0.3s ease-out;
  overflow: hidden;
  max-height: ${props => props.isCollapsed ? '60px' : '1000px'};
`;

const FilterHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.isCollapsed ? '0' : '20px'};
`;

const FilterTitle = styled(Typography)`
  color: #000000;
  font-weight: bold;
  margin-bottom: 0;
`;

const ToggleButton = styled(Button)`
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
`;

const FilterSection = styled.div`
  margin-bottom: 20px;
`;

const FilterLabel = styled(Typography)`
  color: #495057;
  font-weight: 600;
  margin-bottom: 10px;
`;

const ResetButton = styled(Button)`
  margin-top: 20px;
  width: 100%;
`;

const SearchButton = styled(Button)`
  margin-top: 20px;
  width: 100%;
`;

const FilterOption = ({ label, options, selected, onChange }) => (
  <FilterSection>
    <FilterLabel variant="subtitle1">{label}</FilterLabel>
    <div>
      {options.map((option) => (
        <Button
          key={option}
          variant={selected === option ? "contained" : "outlined"}
          onClick={() => onChange(option)}
          className="me-2 mb-2"
        >
          {option}
        </Button>
      ))}
    </div>
  </FilterSection>
);

const StudySearchFilter = ({ updateStudies }) => {
  const [filters, setFilters] = useState({
    topic: '',
    difficulty: '',
    weekDay: '',
    type: '',
    state: '',
  });
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFilterChange = (category, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [category]: prevFilters[category] === value ? '' : value
    }));
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const resetFilters = () => {
    setFilters({
      topic: '',
      difficulty: '',
      weekDay: '',
      type: '',
      state: ''
    });
  };

  const fetchSearchResults = () => {
    setLoading(true);

    const filteredParams = Object.fromEntries(
      Object.entries(filters).filter(([key, value]) => value !== '' && value !== null)
    );

    const queryString = new URLSearchParams(filteredParams).toString();

    axios.get(`${process.env.REACT_APP_DOMAIN}/home/filter/info?${queryString}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
    })
      .then((response) => {
        setSearchResults(Array.isArray(response.data.homeStudyInfoList) ? response.data.homeStudyInfoList : []); 
        updateStudies(Array.isArray(response.data.homeStudyInfoList) ? response.data.homeStudyInfoList : []);
      })
      .catch((error) => {
        console.error('Error during search request:', error);
        setSearchResults([]);
        updateStudies([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <FilterContainer isCollapsed={isCollapsed}>
      <FilterHeader isCollapsed={isCollapsed}>
        <FilterTitle variant="h5">스터디 검색 필터</FilterTitle>
        <ToggleButton variant="outlined" onClick={toggleCollapse}>
          {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
        </ToggleButton>
      </FilterHeader>
      {!isCollapsed && (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            {Object.entries({
              topic: ['주제', '개념학습', '응용/활용', '프로젝트', '챌린지', '자격증/시험', '취업/코테', '특강', '기타'],
              difficulty: ['난이도', '초급', '중급', '고급'],
              weekDay: ['요일', '월', '화', '수', '목', '금', '토', '일'],
              type: ['유형', 'OFFLINE', 'ONLINE']
            }).map(([key, options]) => (
              <FilterOption
                key={key}
                label={options[0]}
                options={options.slice(1)}
                selected={filters[key]}
                onChange={(value) => handleFilterChange(key, value)}
              />
            ))}
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <ResetButton variant="outlined" onClick={resetFilters}>
                초기화
              </ResetButton>
            </Grid>
            <Grid item xs={6}>
              <SearchButton variant="contained" onClick={fetchSearchResults} disabled={loading}>
                {loading ? <CircularProgress size={24} /> : '검색'}
              </SearchButton>
            </Grid>
          </Grid>
        </Grid>
      )}
    </FilterContainer>
  );
};

export default StudySearchFilter;
