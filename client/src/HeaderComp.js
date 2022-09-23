import Spinner from 'react-bootstrap/Spinner';
import Button from 'react-bootstrap/Button';
import Accordion from 'react-bootstrap/Accordion';
import { Reddit, Tools } from 'react-bootstrap-icons';
export const HeaderComp = (props) => {
  const {
    loggedIn,
    loadingPosts,
    loginFn,
    noPosts,
    exportAsJson,
    fileRef,
    readFile,
  } = props;
  if (loggedIn) {
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
          {noPosts ? (
            <>
              <h3>You have {noPosts} saved posts.</h3>
              <input ref={fileRef} type="file" onChange={readFile} hidden />
              <Button
                className={'mb-3'}
                variant="primary"
                onClick={() => {
                  fileRef.current.value = null;
                  fileRef.current.click();
                }}
              >
                Import JSON
              </Button>{' '}
              <Button
                className={'mb-3'}
                variant="primary"
                onClick={exportAsJson}
              >
                Export as JSON
              </Button>
            </>
          ) : (
            <h3>Your saved posts:</h3>
          )}
        </div>
      );
    }
  } else {
    return (
      <div>
        <Button
          style={{
            backgroundColor: '#ff4500',
            borderColor: 'white',
            borderRadius: '10px',
          }}
          onClick={loginFn}
        >
          <Reddit size={30} /> Login with Reddit
        </Button>
      </div>
    );
  }
};
