export const postMatchesSearch = (searchTerm, post) => {
  if (!searchTerm) return true;

  let matches = false;

  if (post.title)
    matches = matches || post.title.toLowerCase().includes(searchTerm);
  if (matches) return true;

  if (post.selftext)
    matches = matches || post.selftext.toLowerCase().includes(searchTerm);
  if (matches) return true;

  if (post.subreddit)
    matches = matches || post.subreddit.toLowerCase().includes(searchTerm);
  if (matches) return true;

  if (post.author)
    matches = matches || post.author.toLowerCase().includes(searchTerm);
  if (matches) return true;

  return matches;
};
