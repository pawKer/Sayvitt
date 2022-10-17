import { Button, Row, Col } from 'react-bootstrap';
import { useContext } from 'react';
import { RedditContext } from '../context/RedditContextProvider';
export const UserProfile = () => {
  const { name, logout } = useContext(RedditContext);
  return (
    <Row className={'mb-3'}>
      <Col className={'mx-auto my-auto'}>
        <h3>
          Hello,{' '}
          <a
            href={`https://www.reddit.com/user/${name}`}
            target="_blank"
            rel="noreferrer"
          >
            <i>{name}</i>
          </a>
          !
        </h3>
        <Button variant="outline-primary" onClick={logout}>
          Logout
        </Button>
      </Col>
    </Row>
  );
};
