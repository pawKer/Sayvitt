import { Button } from 'react-bootstrap';
import { RedditContext } from '../context/RedditContextProvider';
import { useContext } from 'react';
import { Row, Col } from 'react-bootstrap';
export const ActionButtons = () => {
  const {
    selectedPosts,
    data,
    selectAll,
    clearAllSelections,
    submitDeleteSelectedSavedHandler,
  } = useContext(RedditContext);
  return (
    <Row className="mx-auto mb-3">
      <Col>
        <Button
          variant="primary"
          onClick={selectAll}
          disabled={selectedPosts.length === data.length}
        >
          Select all
        </Button>
        <Button
          variant="primary"
          className="ml-3"
          onClick={clearAllSelections}
          disabled={!(selectedPosts.length > 0)}
        >
          Clear selections
        </Button>
        <Button
          variant="danger"
          className="ml-3"
          onClick={submitDeleteSelectedSavedHandler}
          disabled={!(selectedPosts.length > 0)}
        >
          {selectedPosts.length > 0
            ? `Unsave ${selectedPosts.length} posts`
            : 'Unsave selected'}
        </Button>
      </Col>
    </Row>
  );
};
