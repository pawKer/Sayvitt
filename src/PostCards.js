import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { PostCard } from './PostCard';
export const PostCards = (props) => {
    let cols = []
    let items = []
    let data = props.data;
    if(data && data.length > 0) {
        data.forEach((post) => {
            // console.log(post.data)
            let val = <PostCard key={post.data.url}
                                url={post.data.url}
                                permalink={post.data.permalink}
                                name={post.data.name}
                                title={post.data.title}
                                subreddit={post.data.subreddit}
                                handleCheckBox={props.handleCheckBox}
                                preview={post.data.preview ? post.data.preview.images[0].source.url : "https://techforluddites.com/wp-content/plugins/accelerated-mobile-pages/images/SD-default-image.png"} />
                                ;
            if(props.selectedFilters.length === 0)
            {
                cols.push(val)
            } else {
                if(props.selectedFilters.includes(post.data.subreddit.trim())) {
                    cols.push(val)
                }
            }
        })
        // if(cols.length > 3) {
        //     for(let i = 0; i < cols.length - 3; i=i+3) {
        //         items.push(<Row key={i} className="my-2">{cols[i]}{cols[i+1]}{cols[i+2]}</Row>)
        //     }
        // } else {
        //     // console.log(cols)
        //     items.push(<Row key={0}>{cols[0]}{cols[1]}{cols[2]}</Row>)
        // }
    }
    return cols
}