import Button from 'react-bootstrap/Button';
import { RedditContext } from '../context/RedditContextProvider';
import { useContext } from 'react';
export function SubredditFilters() {
  const {
    savedPostsBySubreddit,
    selectedFilters,
    setSelectedFilters,
    setSearchParam,
  } = useContext(RedditContext);
  const subreddits = Array.from(savedPostsBySubreddit.keys());
  const onToggleFilter = (fil) => {
    if (selectedFilters.includes(fil)) {
      setSelectedFilters(selectedFilters.filter((e) => e !== fil));
    } else {
      setSelectedFilters(selectedFilters.concat(fil));
    }
    setSearchParam('');
  };

  return subreddits.map((sub) => (
    <Button
      key={sub}
      variant={selectedFilters.includes(sub) ? 'secondary' : 'light'}
      size="sm"
      className="mx-2 my-2"
      onClick={() => onToggleFilter(sub)}
    >
      r/{sub} ({savedPostsBySubreddit.get(sub).posts.length})
    </Button>
  ));
}
