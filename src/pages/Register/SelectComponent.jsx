import React, { useEffect, useState } from "react";
import Select from "react-select";
import { Form, Row, Col } from "react-bootstrap";
import data from "../../data/전국행정동리스트.json";

const SelectComponent = ({ onCategoryChange, onCityChange, onDistrictChange, onTownChange }) => {
  const [list, setList] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedTown, setSelectedTown] = useState(null);
  const [filteredCities, setFilteredCities] = useState([]);
  const [filteredDistricts, setFilteredDistricts] = useState([]);
  const [filteredTowns, setFilteredTowns] = useState([]);

  useEffect(() => {
    setList(data.LIST);
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      const filteredList = list.filter(item => item.Column1 === selectedCategory.value);
      const cities = filteredList
        .map(item => item.Column2)
        .filter((value, index, self) => value && self.indexOf(value) === index)
        .map(city => ({ value: city, label: city }));
      const districts = filteredList
        .map(item => item.Column3)
        .filter((value, index, self) => value && self.indexOf(value) === index)
        .map(district => ({ value: district, label: district }));
      const towns = filteredList
        .map(item => item.Column4)
        .filter((value, index, self) => value && self.indexOf(value) === index)
        .map(town => ({ value: town, label: town }));

      setFilteredCities(cities);
      setFilteredDistricts(districts);
      setFilteredTowns(towns);
    } else {
      setFilteredCities([]);
      setFilteredDistricts([]);
      setFilteredTowns([]);
    }
  }, [selectedCategory, list]);

  const handleCategoryChange = (selectedOption) => {
    setSelectedCategory(selectedOption);
    onCategoryChange(selectedOption ? selectedOption.value : "");
    setSelectedCity(null); // Reset dependent fields
    setSelectedDistrict(null);
    setSelectedTown(null);
  };

  const handleCityChange = (selectedOption) => {
    setSelectedCity(selectedOption);
    onCityChange(selectedOption ? selectedOption.value : "");
    setSelectedDistrict(null);
    setSelectedTown(null);
  };

  const handleDistrictChange = (selectedOption) => {
    setSelectedDistrict(selectedOption);
    onDistrictChange(selectedOption ? selectedOption.value : "");
    setSelectedTown(null);
  };

  const handleTownChange = (selectedOption) => {
    setSelectedTown(selectedOption);
    onTownChange(selectedOption ? selectedOption.value : "");
  };

  return (
    <div>
      <h1 className="my-4">지역 선택</h1>

      <Form.Group as={Row} className="mb-3">
        <Form.Label column sm="2">대분류</Form.Label>
        <Col sm="10">
          <Select
            value={selectedCategory}
            onChange={handleCategoryChange}
            options={[...new Set(list.map(item => item.Column1))].map(category => ({ value: category, label: category }))}
            placeholder="선택하세요"
          />
        </Col>
      </Form.Group>

      {filteredCities.length > 0 && (
        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm="2">시/군</Form.Label>
          <Col sm="10">
            <Select
              value={selectedCity}
              onChange={handleCityChange}
              options={filteredCities}
              placeholder="선택하세요"
            />
          </Col>
        </Form.Group>
      )}

      {filteredDistricts.length > 0 && (
        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm="2">구</Form.Label>
          <Col sm="10">
            <Select
              value={selectedDistrict}
              onChange={handleDistrictChange}
              options={filteredDistricts}
              placeholder="선택하세요"
            />
          </Col>
        </Form.Group>
      )}

      {filteredTowns.length > 0 && (
        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm="2">동/면/리</Form.Label>
          <Col sm="10">
            <Select
              value={selectedTown}
              onChange={handleTownChange}
              options={filteredTowns}
              placeholder="선택하세요"
            />
          </Col>
        </Form.Group>
      )}
    </div>
  );
};

export default SelectComponent;
