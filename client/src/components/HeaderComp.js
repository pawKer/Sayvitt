import Spinner from 'react-bootstrap/Spinner';
import Button from 'react-bootstrap/Button';

import { Reddit } from 'react-bootstrap-icons';

import { useContext } from 'react';
import { RedditContext } from '../context/RedditContextProvider';
import { AdvancedTools } from './AdvancedTools';

export const HeaderComp = () => {
  const { data, loggedIn, loadingPosts, loginWithReddit } =
    useContext(RedditContext);

  const noPosts = data && data.length;

  if (!loggedIn) {
    return (
      <div>
        <Button
          style={{
            backgroundColor: '#ff4500',
            borderColor: 'white',
            borderRadius: '10px',
          }}
          onClick={loginWithReddit}
        >
          <Reddit size={30} /> Login with Reddit
        </Button>
      </div>
    );
  }

  if (loadingPosts) {
    return (
      <div>
        <h3>Loading your saved posts...</h3>
        <Spinner animation="border" role="status" variant="primary">
          <span className="sr-only">Loading...</span>
        </Spinner>
      </div>
    );
  } else {
    return (
      <div>
        {noPosts >= 0 ? (
          <>
            <h3>You have {noPosts} saved posts.</h3>
            <AdvancedTools />
          </>
        ) : (
          <h3>Your saved posts:</h3>
        )}
      </div>
    );
  }
};
