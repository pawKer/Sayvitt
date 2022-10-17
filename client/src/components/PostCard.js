import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import prettyMilliseconds from 'pretty-ms';
export const PostCard = (props) => {
  const htmlDecode = (input) => {
    var doc = new DOMParser().parseFromString(input, 'text/html');
    return doc.documentElement.textContent;
  };
  return (
    <Col key={props.permalink} data-index={props.index}>
      <Card
        key={props.permalink}
        className={'postCard'}
        style={{
          backgroundColor:
            props.selectedPosts.includes(props.name) && '#ffd8bd',
        }}
        onClick={(e) => props.handleCheckBox(e, props.name)}
      >
        <Card.Body className={'cardBody'}>
          <a
            href={`http://reddit.com${props.permalink}`}
            target="_blank"
            rel="noreferrer"
            className={'cardTitle'}
          >
            {props.title}
          </a>
          <p className={'cardSubtitle'}>
            r/{props.subreddit}
            {!props.description && props.url && (
              <>
                ・
                <a
                  href={props.url}
                  style={{ color: 'gray' }}
                  target="_blank"
                  rel="noreferrer"
                >
                  {props.url.split('/')[2].replace('www.', '')}
                </a>
              </>
            )}
          </p>
          {props.description && props.description !== '[removed]' && (
            <p className={'description'}>
              {props.description.substring(0, 200)}
              {props.description.length > 200 && '...'}
            </p>
          )}
        </Card.Body>
        {(props.preview || props.thumbnail) && (
          <a
            href={htmlDecode(props.preview || props.thumbnail)}
            target="_blank"
            rel="noreferrer"
          >
            <Card.Img
              variant="top"
              src={htmlDecode(props.preview || props.thumbnail)}
              style={{ width: '100%' }}
            />
          </a>
        )}
        <Card.Footer>
          <small className="text-muted">
            #{props.index}・u/{props.author}・
            {prettyMilliseconds(Date.now() - props.date * 1000, {
              compact: true,
            })}
          </small>
        </Card.Footer>
      </Card>
    </Col>
  );
};
