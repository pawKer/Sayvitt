import { PostCard } from './PostCard';
export const PostCards = (props) => {
  let cols = [];
  let data = props.data;
  if (data && data.length > 0) {
    let i = data.length;
    data.forEach((post) => {
      let val = (
        <PostCard
          key={post.data.permalink}
          url={post.data.url}
          permalink={post.data.permalink}
          name={post.data.name}
          title={post.data.title}
          subreddit={post.data.subreddit}
          handleCheckBox={props.handleCheckBox}
          selectedPosts={props.selectedPosts}
          index={i}
          preview={post.data.preview && post.data.preview.images[0].source.url}
        />
      );
      if (props.selectedFilters.length === 0) {
        cols.push(val);
      } else {
        if (props.selectedFilters.includes(post.data.subreddit.trim())) {
          cols.push(val);
        }
      }
      i--;
    });
    // if(cols.length > 3) {
    //     for(let i = 0; i < cols.length - 3; i=i+3) {
    //         items.push(<Row key={i} className="my-2">{cols[i]}{cols[i+1]}{cols[i+2]}</Row>)
    //     }
    // } else {
    //     // console.log(cols)
    //     items.push(<Row key={0}>{cols[0]}{cols[1]}{cols[2]}</Row>)
    // }
  }
  return cols;
};
