import Spinner from 'react-bootstrap/Spinner';
import Button from 'react-bootstrap/Button';
import { Reddit } from 'react-bootstrap-icons';
export const HeaderComp = (props) => {
  const { loggedIn, loadingPosts, loginFn } = props;
  if (loggedIn) {
    if (loadingPosts) {
      return (
        <div>
          <h3>Loading your saved posts...</h3>
          <Spinner animation="border" role="status">
            <span className="sr-only">Loading...</span>
          </Spinner>
        </div>
      );
    } else {
      return (
        <div>
          <h3>Your saved posts:</h3>
        </div>
      );
    }
  } else {
    return (
      <div>
        <h3>Click below to get started</h3>
        <Button
          style={{ backgroundColor: '#ff4500', borderColor: 'white' }}
          onClick={loginFn}
        >
          <Reddit size={30} /> Login with Reddit
        </Button>
      </div>
    );
  }
};
