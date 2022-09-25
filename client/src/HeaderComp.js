import Spinner from 'react-bootstrap/Spinner';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Accordion from 'react-bootstrap/Accordion';
import {
  Reddit,
  Tools,
  ChevronDown,
  Download,
  Upload,
} from 'react-bootstrap-icons';
import { useAccordionButton } from 'react-bootstrap/AccordionButton';
const CustomToggle = ({ children, eventKey }) => {
  const decoratedOnClick = useAccordionButton(eventKey, () => {});

  return (
    <h4 as="button" onClick={decoratedOnClick} className={'mb-0'}>
      {children}
    </h4>
  );
};
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
          {noPosts >= 0 ? (
            <>
              <h3>You have {noPosts} saved posts.</h3>
              <input ref={fileRef} type="file" onChange={readFile} hidden />
              <Accordion className={'mb-3'}>
                <Card>
                  <Card.Header>
                    <CustomToggle eventKey="0">
                      <Tools size={25} /> Advanced tools {'  '}
                      <ChevronDown size={20} />
                    </CustomToggle>
                  </Card.Header>
                  <Accordion.Collapse eventKey="0">
                    <Card.Body>
                      <Button
                        variant="primary"
                        onClick={() => {
                          fileRef.current.value = null;
                          fileRef.current.click();
                        }}
                      >
                        <Upload /> Import JSON
                      </Button>{' '}
                      <Button variant="primary" onClick={exportAsJson}>
                        <Download /> Export all as JSON
                      </Button>
                    </Card.Body>
                  </Accordion.Collapse>
                </Card>
              </Accordion>
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
