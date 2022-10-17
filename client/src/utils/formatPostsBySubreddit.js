export const formatSavedPostsBySubreddit = (data) => {
  let items = new Map();
  if (data && data.length > 0) {
    data.forEach((post) => {
      if (items.has(post.data.subreddit)) {
        items.get(post.data.subreddit).posts.push({
          id: post.data.id,
          url: post.data.permalink,
          title: post.data.title,
        });
      } else {
        items.set(post.data.subreddit, { posts: [] });
        items.get(post.data.subreddit).posts.push({
          id: post.data.id,
          url: post.data.permalink,
          title: post.data.title,
        });
      }
    });
  }
  return items;
};
