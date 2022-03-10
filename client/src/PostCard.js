import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
export const PostCard = (props) => {
  const htmlDecode = (input) => {
    var doc = new DOMParser().parseFromString(input, 'text/html');
    return doc.documentElement.textContent;
  };
  return (
    <Col key={props.permalink}>
      <Card
        key={props.permalink}
        className={'postCard'}
        style={{
          backgroundColor:
            props.selectedPosts.includes(props.name) && '#ffd8bd',
        }}
        onClick={(e) => props.handleCheckBox(e, props.name)}
      >
        <Card.Body>
          <a
            href={`http://reddit.com${props.permalink}`}
            target="_blank"
            rel="noreferrer"
          >
            {props.title}
          </a>
          <p>r/{props.subreddit}</p>
        </Card.Body>
        {props.preview && (
          <Card.Img
            variant="top"
            src={htmlDecode(props.preview)}
            style={{ width: '100%', height: '15vw' }}
          />
        )}
        <Card.Footer>
          <Form.Group controlId="formBasicCheckbox">
            {/* <Form.Check
              type="checkbox"
              label="Select"
              checked={props.selectedPosts.includes(props.name)}
              onChange={(e) => props.handleCheckBox(e, props.name)}
            /> */}
          </Form.Group>
          <small className="text-muted">#{props.index}</small>
        </Card.Footer>
      </Card>
    </Col>
  );
};
