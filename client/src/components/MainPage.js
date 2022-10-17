import { useCallback } from 'react';
import { SubredditFilters } from './SubredditFilters';
import { HeaderComp } from './HeaderComp';
import 'react-confirm-alert/src/react-confirm-alert.css';

import {
  InputGroup,
  FormControl,
  Button,
  Row,
  Col,
  Container,
} from 'react-bootstrap';
import Masonry from 'react-masonry-css';
import debounce from 'lodash.debounce';

import { getAllPostCards } from '../utils/getAllPostCards';
import { postMatchesSearch } from '../utils/postMatchesSearch';
import { PreLoginHeader } from './PreLoginHeader';
import { useContext } from 'react';
import { RedditContext } from '../context/RedditContextProvider';
import { ActionButtons } from './ActionButtons';

export function MainPage() {
  const {
    data,
    selectedFilters,
    postsToDisplay,
    setPostsToDisplay,
    name,
    subredditFiltered,
    setSubredditFiltered,
    loggedIn,
    loadingPosts,
    selectedPosts,
    setSelectedPosts,
    searchParam,
    setSearchParam,
    clearAllFilters,
    logout,
  } = useContext(RedditContext);

  const debounceSearch = useCallback(
    debounce(
      (searchTerm, data, selectedFilters, filteredPosts) =>
        findMatches(searchTerm, data, selectedFilters, filteredPosts),
      300
    ),
    [] // will be created only once initially
  );

  const handleCheckBox = (e, postName) => {
    if (!selectedPosts.includes(postName)) {
      setSelectedPosts(selectedPosts.concat(postName));
    } else {
      setSelectedPosts(selectedPosts.filter((e) => e !== postName));
    }
  };

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

  const searchOnChange = (e) => {
    setSearchParam(e.target.value);
    debounceSearch(e.target.value, data, selectedFilters, subredditFiltered);
  };

  return (
    <div className="App">
      <Container>
        <Row className={'mb-3'}>
          <Col className={'my-auto'}>
            <h1
              className={
                loggedIn ? 'mb-0 headerStyle loggedIn' : 'mb-0 headerStyle'
              }
            >
              Sayvitt
            </h1>
          </Col>
        </Row>
        {loggedIn && (
          <Row className={'mb-3'}>
            <Col className={'mx-auto my-auto'}>
              <h3>
                Hello,{' '}
                <a
                  href={`https://www.reddit.com/user/${name}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <i>{name}</i>
                </a>
                !
              </h3>
              <Button variant="outline-primary" onClick={logout}>
                Logout
              </Button>
            </Col>
          </Row>
        )}
        {!loggedIn && <PreLoginHeader />}
        <Row>
          <Col>
            <HeaderComp />
          </Col>
        </Row>
      </Container>
      {loggedIn && !loadingPosts && data.length > 0 && (
        <Container fluid="md">
          <Row>
            <Col>
              <InputGroup>
                <FormControl
                  style={{ borderRadius: '10px' }}
                  placeholder="Search saved posts..."
                  onChange={searchOnChange}
                  value={searchParam}
                />
                <InputGroup.Text
                  style={{ borderRadius: '10px' }}
                  id="basic-addon2"
                >
                  {postsToDisplay.length}
                </InputGroup.Text>
              </InputGroup>
            </Col>
          </Row>
          {selectedFilters.length > 0 && (
            <Row>
              <Button
                variant="primary"
                className="mx-auto mt-3"
                onClick={clearAllFilters}
                disabled={!(selectedFilters.length > 0)}
              >
                Clear all filters
              </Button>
            </Row>
          )}
          <Row className="mx-auto my-3">
            <Col>
              <SubredditFilters />
            </Col>
          </Row>

          <Row className="mx-auto mb-3">
            <Col>
              <ActionButtons />
            </Col>
          </Row>
          <Masonry
            breakpointCols={{
              default: 3,
              1100: 2,
              700: 2,
              500: 1,
            }}
            className="my-masonry-grid"
            columnClassName="my-masonry-grid_column"
          >
            {getAllPostCards(postsToDisplay, selectedPosts, handleCheckBox)}
          </Masonry>
        </Container>
      )}
    </div>
  );
}
