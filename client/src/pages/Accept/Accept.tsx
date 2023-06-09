// modules
import React, { useState } from 'react';
import { Col, Row } from 'antd';

// 원래랑 비슷한데
// create시에 address란에 메타마스크 연결 버튼
// accept에 관한 건 ?
// 내가 생각하는 방식은
// 합의 후 일방이 create => 생성된 컨트랙트 주소 반환
// 상대방은 컨트랙트 주소를 accept에 입력 => 계약 내용 출력
//
const Accept: React.FC = () => {
  return (
    <Row justify="center" align="middle">
      <Col span={24}>
        <div>Accept</div>
      </Col>
    </Row>
  );
};

export default Accept;
