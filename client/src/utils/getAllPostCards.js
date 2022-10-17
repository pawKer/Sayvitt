import { PostCard } from '../components/PostCard';
export const getAllPostCards = (
  postsToDisplay,
  selectedPosts,
  handleSelect
) => {
  if (!postsToDisplay || postsToDisplay.length === 0) {
    return [];
  }
  return postsToDisplay.map((post, index) => {
    return (
      <PostCard
        key={post.data.permalink}
        url={post.data.url}
        permalink={post.data.permalink}
        name={post.data.name}
        title={post.data.title}
        date={post.data.created}
        author={post.data.author}
        description={post.data.selftext}
        subreddit={post.data.subreddit}
        handleCheckBox={handleSelect}
        selectedPosts={selectedPosts}
        index={postsToDisplay.length - index}
        preview={post.data.preview && post.data.preview.images[0].source.url}
        thumbnail={
          post.data.thumbnail &&
          !['self', 'spoiler', 'default', 'nsfw'].includes(post.data.thumbnail)
            ? post.data.thumbnail
            : undefined
        }
      />
    );
  });
};
