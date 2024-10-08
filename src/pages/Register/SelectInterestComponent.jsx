import React, { useEffect, useState } from "react";
import { Form, Row, Col } from "react-bootstrap";
import data from "../../data/관심사리스트.json";

const SelectInterestComponent = ({ onChange }) => {


  const [list, setList] = useState([]);
  const [selectedInterest, setSelectedInterest] = useState("");

  useEffect(() => {
    setList(data.IT_Interests);
  }, []);

  // 관심사가 변경될 때만 부모 컴포넌트로 알림
  useEffect(() => {
    if (selectedInterest) {
      onChange(selectedInterest); // 부모 컴포넌트로 값 전달
    }
  }, [selectedInterest]);  // onChange는 종속성 배열에서 제거

  return (
    <Form.Group as={Row} className="mb-3">
      <Form.Label column sm="2">관심사</Form.Label>
      <Col sm="10">
        <Form.Select
          value={selectedInterest}
          onChange={(e) => setSelectedInterest(e.target.value)}
        >
          <option value="">관심사를 선택하세요</option>
          {list.map((interest, index) => (
            <option key={index} value={interest}>
              {interest}
            </option>
          ))}
        </Form.Select>
      </Col>
    </Form.Group>
  );
};

export default SelectInterestComponent;
