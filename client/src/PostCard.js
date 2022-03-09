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
      <Card key={props.permalink}>
        <Card.Body>
          <a href={`http://reddit.com${props.permalink}`}>{props.title}</a>
          <p>r/{props.subreddit}</p>
        </Card.Body>
        <Card.Img
          variant="top"
          src={htmlDecode(props.preview)}
          style={{ width: '100%', height: '15vw' }}
        />
        <Card.Footer>
          <Form.Group controlId="formBasicCheckbox">
            <Form.Check
              type="checkbox"
              label="Check me out"
              onChange={() => props.handleCheckBox(props.name)}
            />
          </Form.Group>
        </Card.Footer>
      </Card>
    </Col>
  );
};
