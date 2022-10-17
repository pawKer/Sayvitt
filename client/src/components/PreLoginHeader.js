import { Row, Col } from 'react-bootstrap';
export const PreLoginHeader = () => {
  return (
    <Row className={'mb-3'}>
      <Col style={{ color: '#b5b5b5' }}>
        <h4 className={'mb-0'}>👉 Easily manage your saved posts</h4>
        <h4 className={'mb-0'}>👉 Unsave multiple posts at once</h4>
        <h4 className={'mb-0'}>👉 Search for any keyword</h4>
        <h4 className={'mb-0'}>👉 No data is stored</h4>
      </Col>
    </Row>
  );
};
