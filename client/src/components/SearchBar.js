import { Row, Col, InputGroup, FormControl } from 'react-bootstrap';
import { useContext, useCallback } from 'react';
import { RedditContext } from '../context/RedditContextProvider';
import { postMatchesSearch } from '../utils/postMatchesSearch';
import debounce from 'lodash.debounce';
export const SearchBar = () => {
  const {
    data,
    selectedFilters,
    subredditFiltered,
    searchParam,
    postsToDisplay,
    setSearchParam,
    setPostsToDisplay,
    setSubredditFiltered,
  } = useContext(RedditContext);
  const findMatches = (searchTerm, data, selectedFilters, filteredPosts) => {
    if (searchTerm) {
      searchTerm = searchTerm.toLowerCase();
      console.log('called', searchTerm);
      const dataToSearch = filteredPosts.length > 0 ? filteredPosts : data;
      setPostsToDisplay(
        dataToSearch.filter((post) => postMatchesSearch(searchTerm, post.data))
      );
    } else {
      if (selectedFilters.length === 0) {
        setSubredditFiltered([]);
        setPostsToDisplay(data);
      } else {
        setPostsToDisplay(filteredPosts);
      }
    }
  };
  const debounceSearch = useCallback(
    debounce(
      (searchTerm, data, selectedFilters, filteredPosts) =>
        findMatches(searchTerm, data, selectedFilters, filteredPosts),
      300
    ),
    [] // will be created only once initially
  );
  const searchOnChange = (e) => {
    setSearchParam(e.target.value);
    debounceSearch(e.target.value, data, selectedFilters, subredditFiltered);
  };
  return (
    <Row>
      <Col>
        <InputGroup>
          <FormControl
            style={{ borderRadius: '10px' }}
            placeholder="Search saved posts..."
            onChange={searchOnChange}
            value={searchParam}
          />
          <InputGroup.Text style={{ borderRadius: '10px' }} id="basic-addon2">
            {postsToDisplay.length}
          </InputGroup.Text>
        </InputGroup>
      </Col>
    </Row>
  );
};
