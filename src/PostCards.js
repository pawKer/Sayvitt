import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
export const PostCards = (props) => {
    let cols = []
    let items = []
    let data = props.data;
    if(data && data.length > 0) {
        data.forEach((post) => {
            let val = <Col key={post.data.url} md={4}>
                        <Card key={post.data.url} style={{height: '100%'}}>
                        <Card.Body>
                            <a href={`http://reddit.com${post.data.permalink}`}>{post.data.title}</a>
                        </Card.Body>
                        <Card.Footer>
                        <Form.Group controlId="formBasicCheckbox">
                            <Form.Check type="checkbox" label="Check me out" onChange={props.handleCheckBox}/>
                        </Form.Group>
                        </Card.Footer>
                        </Card>
                    </Col>
            if(props.selectedFilters.length === 0)
            {
                cols.push(val)
            } else {
                if(props.selectedFilters.includes(post.data.subreddit.trim())) {
                    cols.push(val)
                }
            }
        })
        if(cols.length > 3) {
            for(let i = 0; i < cols.length - 3; i=i+3) {
                items.push(<Row key={i} className="my-2">{cols[i]}{cols[i+1]}{cols[i+2]}</Row>)
            }
        } else {
            items.push(<Row key={0}>{cols[0]}{cols[1]}{cols[2]}</Row>)
        }
    }
    return items
}