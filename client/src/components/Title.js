import { Row, Col } from 'react-bootstrap';
import { useContext } from 'react';
import { RedditContext } from '../context/RedditContextProvider';
export const Title = () => {
  const { loggedIn } = useContext(RedditContext);
  return (
    <Row className={'mb-3'}>
      <Col className={'my-auto'}>
        <h1
          className={
            loggedIn ? 'mb-0 headerStyle loggedIn' : 'mb-0 headerStyle'
          }
        >
          Sayvitt
        </h1>
      </Col>
    </Row>
  );
};
