import React, { useEffect, useState } from "react";
import { Form, Row, Col } from "react-bootstrap";
import Select from "react-select";
import data from "../../data/관심사리스트.json";

const SelectInterestComponent = ({ onChange }) => {
  const [list, setList] = useState([]);
  const [selectedInterest, setSelectedInterest] = useState(null);

  useEffect(() => {
    setList(data.IT_Interests);
  }, []);

  useEffect(() => {
    if (selectedInterest) {
      onChange(selectedInterest.value); // 부모 컴포넌트로 값 전달
    }
  }, [selectedInterest]);

  const options = list.map((interest) => ({
    value: interest,
    label: interest,
  }));

  return (
    <Form.Group as={Row} className="mb-3">
      <Form.Label column sm="2">관심사</Form.Label>
      <Col sm="10">
        <Select
          value={selectedInterest}
          onChange={setSelectedInterest}
          options={options}
          placeholder="관심사를 선택하세요"
        />
      </Col>
    </Form.Group>
  );
};

export default SelectInterestComponent;