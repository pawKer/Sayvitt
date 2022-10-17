import { SubredditFilters } from './SubredditFilters';
import { HeaderComp } from './HeaderComp';
import 'react-confirm-alert/src/react-confirm-alert.css';

import { Button, Row, Col, Container } from 'react-bootstrap';
import Masonry from 'react-masonry-css';

import { getAllPostCards } from '../utils/getAllPostCards';
import { PreLoginHeader } from './PreLoginHeader';
import { useContext } from 'react';
import { RedditContext } from '../context/RedditContextProvider';
import { ActionButtons } from './ActionButtons';
import { UserProfile } from './UserProfile';
import { Title } from './Title';
import { SearchBar } from './SearchBar';

export function MainPage() {
  const {
    data,
    selectedFilters,
    postsToDisplay,
    loggedIn,
    loadingPosts,
    selectedPosts,
    setSelectedPosts,
    clearAllFilters,
  } = useContext(RedditContext);

  const handleSelect = (e, postName) => {
    if (!selectedPosts.includes(postName)) {
      setSelectedPosts(selectedPosts.concat(postName));
    } else {
      setSelectedPosts(selectedPosts.filter((e) => e !== postName));
    }
  };

  return (
    <div className="App">
      <Container>
        <Title />
        {loggedIn ? <UserProfile /> : <PreLoginHeader />}
        <Row>
          <Col>
            <HeaderComp />
          </Col>
        </Row>
      </Container>
      {loggedIn && !loadingPosts && data.length > 0 && (
        <Container fluid="md">
          <SearchBar />
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

          <SubredditFilters />

          <ActionButtons />

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
            {getAllPostCards(postsToDisplay, selectedPosts, handleSelect)}
          </Masonry>
        </Container>
      )}
    </div>
  );
}
