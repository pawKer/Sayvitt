import { useEffect, useState, useCallback } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { SubredditFilters } from './SubredditFilters';
import { PostCard } from './PostCard';
import { HeaderComp } from './HeaderComp';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { InputGroup, FormControl, Button } from 'react-bootstrap';
import Masonry from 'react-masonry-css';
import debounce from 'lodash.debounce';

export function MainPage() {
  const [code, setCode] = useState();
  const [accessToken, setAccessToken] = useState();
  const [loggedIn, setLoggedIn] = useState(false);
  const [name, setName] = useState('');
  const [data, setData] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [savedPostsBySubreddit, setSavedPostsBySubreddit] = useState(new Map());
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [searchParam, setSearchParam] = useState('');
  const locationz = useLocation();
  const history = useHistory();

  const debounceSearch = useCallback(
    debounce((searchTerm, data) => findMatches(searchTerm, data), 300),
    [] // will be created only once initially
  );

  const onToggleFilter = (fil) => {
    if (selectedFilters.includes(fil)) {
      setSelectedFilters(selectedFilters.filter((e) => e !== fil));
    } else {
      setSelectedFilters(selectedFilters.concat(fil));
    }
  };

  useEffect(() => {
    if (
      localStorage.getItem('accessToken') &&
      data.length === 0 &&
      localStorage.getItem('tokenExpired') === 'false'
    ) {
      const token = localStorage.getItem('accessToken');
      getProfileData(token)
        .then(async (name) => await getPosts(token, name))
        .catch(() => {
          localStorage.setItem('tokenExpired', true);
          loginWithReddit();
        });
    } else {
      const searchParams = new URLSearchParams(locationz.search);
      if (searchParams.get('code') && !code) {
        setCode(searchParams.get('code'));
        getAccessToken(searchParams.get('code')).then(async (token) => {
          localStorage.setItem('tokenExpired', false);
          const nameRes = await getProfileData(token);
          await getPosts(token, nameRes);
        });
        searchParams.delete('code');
        searchParams.delete('state');
        history.replace({
          search: searchParams.toString(),
        });
      }
    }
  }, []);

  const loginWithReddit = () => {
    let redirect_url = `https://www.reddit.com/api/v1/authorize?client_id=${
      process.env.REACT_APP_REDDIT_API_USER
    }&response_type=code&state=${Math.random()
      .toString(36)
      .substring(2)}&redirect_uri=${
      process.env.REACT_APP_URI
    }&duration=temporary&scope=identity,history,save`;
    localStorage.setItem('redirected', true);
    window.location.replace(redirect_url);
  };

  const getAccessToken = async (codeParam) => {
    return fetch(`/api/v1/accessToken`, {
      method: 'post',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: codeParam,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setAccessToken(data.token);
        localStorage.setItem('accessToken', data.token);
        return data.token;
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const getProfileData = async (accessTokenParam) => {
    // NOW USE THE TOKEN TO GET DATA
    return fetch('/api/v1/getProfile', {
      method: 'post',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accessToken: accessTokenParam,
      }),
    })
      .then((res) => {
        if (res.status === 200) {
          setLoggedIn(true);
          return res.json();
        } else if (res.status === 401) {
          localStorage.removeItem('accessToken');
          Promise.reject();
        } else {
          throw Error('Something else happened idk what');
        }
      })
      .then((data) => {
        if (data.data.name) {
          setName(data.data.name);
          return data.data.name;
        }
        console.log(data);
      });
  };

  const getPosts = async (accessTokenParam, nameParam) => {
    console.log('GOTCHANAME', nameParam);
    setLoadingPosts(true);
    let resp = await fetch(`/api/v1/getSavedPosts`, {
      method: 'post',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: nameParam,
        accessToken: accessTokenParam,
      }),
    });

    let responseData = await resp.json();
    setData(responseData);
    formatSavedPostsBySubreddit(responseData);
    // setSavedPostsById(
    //   responseData.reduce((map, obj) => {
    //     map[obj.data.id] = obj.data;
    //     return map;
    //   }, {})
    // );
    setLoadingPosts(false);
  };

  const formatSavedPostsBySubreddit = (data) => {
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
      setSavedPostsBySubreddit(items);
    }
  };

  const handleCheckBox = (e, id) => {
    if (!selectedPosts.includes(id)) {
      setSelectedPosts(selectedPosts.concat(id));
    } else {
      setSelectedPosts(selectedPosts.filter((e) => e !== id));
    }
  };

  const handleOnClickDeleteAllSelected = (e) => {
    selectedPosts.forEach(async (postId) => {
      let resp = await fetch(`/api/v1/unsavePost`, {
        method: 'post',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId,
          accessToken: localStorage.getItem('accessToken'),
        }),
      });

      if (resp.status === 401) {
        localStorage.setItem('tokenExpired', true);
        return loginWithReddit();
      }

      let respJson = await resp.json();
      console.log('Deleted ', postId);
    });

    let newData = data;
    selectedPosts.forEach((postId) => {
      newData = newData.filter((item) => item.data.name !== postId);
    });
    setData(newData);
    formatSavedPostsBySubreddit(newData);
    setSelectedPosts([]);
    clearAllFilters();
  };

  const submitDeleteSelectedSaved = () => {
    confirmAlert({
      title: 'Confirm to submit',
      message: `Are you sure you want to unsave ${selectedPosts.length} posts?`,
      buttons: [
        {
          label: 'Yes',
          onClick: handleOnClickDeleteAllSelected,
        },
        {
          label: 'No',
        },
      ],
    });
  };

  const clearAllFilters = () => {
    setSelectedFilters([]);
  };

  const logout = () => {
    setLoggedIn(false);
    setName(undefined);
    setData([]);
    setFilteredPosts([]);
    setSelectedFilters([]);
    setSearchParam('');
    setSavedPostsBySubreddit(new Map());
    setLoadingPosts(false);
    localStorage.clear();
  };

  const clearAllSelections = () => {
    setSelectedPosts([]);
  };

  const findMatches = (searchTerm, data) => {
    setSearchParam(searchTerm);
    if (searchTerm) {
      searchTerm = searchTerm.toLowerCase();
    } else {
      setFilteredPosts([]);
      return;
    }
    console.log('called', searchTerm);
    setFilteredPosts(
      data
        .filter((post) => postMatchesSearch(searchTerm, post.data))
        .map((post) => post.data.id)
    );
  };

  const searchOnChange = (e) => {
    debounceSearch(e.target.value, data);
  };

  const postMatchesSearch = (searchTerm, post) => {
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

  const getCards = () => {
    let cols = [];
    if (data && data.length > 0) {
      let i = data.length;
      data.forEach((post) => {
        let shouldAdd = false;

        if (selectedFilters.length === 0) {
          shouldAdd = true;
        } else {
          if (selectedFilters.includes(post.data.subreddit.trim())) {
            shouldAdd = true;
          }
        }

        if (filteredPosts.length === 0) {
          if (searchParam) {
            shouldAdd = false;
          }
        } else {
          if (!filteredPosts.includes(post.data.id)) {
            shouldAdd = false;
          }
        }

        if (shouldAdd) {
          let val = (
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
              handleCheckBox={handleCheckBox}
              selectedPosts={selectedPosts}
              index={i}
              preview={
                post.data.preview && post.data.preview.images[0].source.url
              }
              thumbnail={
                post.data.thumbnail &&
                !['self', 'spoiler', 'default', 'nsfw'].includes(
                  post.data.thumbnail
                )
                  ? post.data.thumbnail
                  : undefined
              }
            />
          );
          cols.push(val);
        }
        i--;
      });
    }

    return cols;
  };

  return (
    <div className="App">
      <div>
        {name ? (
          <h1>
            Hello,{' '}
            <a
              href={`https://www.reddit.com/user/${name}`}
              target="_blank"
              rel="noreferrer"
            >
              <i>{name}</i>
            </a>
            !
          </h1>
        ) : (
          <h1>Hello!</h1>
        )}
        {loggedIn && (
          <Button
            variant="outline-primary"
            className="mx-3 my-3"
            onClick={logout}
          >
            Logout
          </Button>
        )}
        <HeaderComp
          loadingPosts={loadingPosts}
          loggedIn={loggedIn}
          loginFn={loginWithReddit}
          noPosts={data && data.length}
        ></HeaderComp>
      </div>
      {data.length > 0 && (
        <Container fluid="md">
          <Row>
            <Col>
              <InputGroup>
                <FormControl
                  style={{ borderRadius: '10px' }}
                  placeholder="Search saved posts..."
                  onChange={searchOnChange}
                />
                <InputGroup.Text
                  style={{ borderRadius: '10px' }}
                  id="basic-addon2"
                >
                  {filteredPosts.length === 0 && !searchParam
                    ? data.length
                    : filteredPosts.length}
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
              <SubredditFilters
                subreddits={Array.from(savedPostsBySubreddit.keys())}
                data={savedPostsBySubreddit}
                onToggleFilter={onToggleFilter}
                activeFilters={selectedFilters}
              />
            </Col>
          </Row>
          {selectedPosts.length > 0 && (
            <Row className="mx-auto mb-3">
              <Col>
                <Button
                  variant="primary"
                  onClick={clearAllSelections}
                  disabled={!(selectedPosts.length > 0)}
                >
                  Clear selections
                </Button>
                <Button
                  variant="danger"
                  className="ml-3"
                  onClick={submitDeleteSelectedSaved}
                  disabled={!(selectedPosts.length > 0)}
                >
                  Unsave selected
                </Button>
              </Col>
            </Row>
          )}
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
            {getCards().map((col) => col)}
          </Masonry>
        </Container>
      )}
    </div>
  );
}
