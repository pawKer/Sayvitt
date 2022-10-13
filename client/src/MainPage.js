import { useEffect, useState, useCallback, useRef } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { SubredditFilters } from './SubredditFilters';
import { PostCard } from './PostCard';
import { HeaderComp } from './HeaderComp';
import { confirmAlert } from 'react-confirm-alert';
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

export function MainPage() {
  const [code, setCode] = useState();
  const [accessToken, setAccessToken] = useState();
  const [loggedIn, setLoggedIn] = useState(false);
  const [name, setName] = useState('');
  const [data, setData] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [savedPostsBySubreddit, setSavedPostsBySubreddit] = useState(new Map());
  const [subredditFiltered, setSubredditFiltered] = useState([]);
  const [postsToDisplay, setPostsToDisplay] = useState();
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [searchParam, setSearchParam] = useState('');
  const [fileContent, setFileContent] = useState('');
  const fileRef = useRef();
  const locationz = useLocation();
  const history = useHistory();

  const debounceSearch = useCallback(
    debounce(
      (searchTerm, data, selectedFilters, filteredPosts) =>
        findMatches(searchTerm, data, selectedFilters, filteredPosts),
      300
    ),
    [] // will be created only once initially
  );

  const onToggleFilter = (fil) => {
    if (selectedFilters.includes(fil)) {
      setSelectedFilters(selectedFilters.filter((e) => e !== fil));
    } else {
      setSelectedFilters(selectedFilters.concat(fil));
    }
    setSearchParam('');
  };

  useEffect(() => {
    setPostsToDisplay(data);
  }, [data]);

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

  useEffect(() => {
    console.log('setting filtered');
    const filt = data.filter((post) => {
      if (selectedFilters.length === 0) {
        return false;
      } else {
        if (selectedFilters.includes(post.data.subreddit.trim())) {
          return true;
        }
      }
      return false;
    });
    console.log(filt);

    if (selectedFilters.length === 0) {
      setPostsToDisplay(data);
    } else {
      setPostsToDisplay(filt);
    }
    setSubredditFiltered(filt);
  }, [data, selectedFilters]);

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
          setLoggedIn(true);
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

  const handleCheckBox = (e, postName) => {
    if (!selectedPosts.includes(postName)) {
      setSelectedPosts(selectedPosts.concat(postName));
    } else {
      setSelectedPosts(selectedPosts.filter((e) => e !== postName));
    }
  };

  const handleOnClickDeleteAllSelected = async (e) => {
    setLoadingPosts(true);
    for (let postId of selectedPosts) {
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
    }

    let newData = data;
    selectedPosts.forEach((postId) => {
      newData = newData.filter((item) => item.data.name !== postId);
    });
    setLoadingPosts(false);
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

  const exportAsJson = () => {
    let index = data.length;
    const postList = data.map((post) => {
      return {
        index: index--,
        id: post.data.id,
        postName: post.data.name,
        title: post.data.title,
        url: post.data.url,
      };
    });
    const element = document.createElement('a');
    const file = new Blob([JSON.stringify(postList)], {
      type: 'application/json',
    });
    element.href = URL.createObjectURL(file);
    element.download = 'savedPosts.json';
    document.body.appendChild(element);
    element.click();
  };

  const readFile = (event) => {
    const fileReader = new FileReader();
    const { files } = event.target;
    try {
      fileReader.readAsText(files[0], 'UTF-8');
    } catch {
      alert('Imported file is not valid.');
      return;
    }

    fileReader.onload = (e) => {
      const content = e.target.result;
      let jsonContent;
      try {
        jsonContent = JSON.parse(content);
        setFileContent(jsonContent);
      } catch {
        alert('Imported file is not valid JSON.');

        return;
      }
    };
  };

  const handleSaveImportedPosts = useCallback(async () => {
    setLoadingPosts(true);

    for (let i = fileContent.length - 1; i >= 0; i--) {
      console.log(`Save post id: ${fileContent[i].postName}`);
      let resp = await fetch(`/api/v1/savePost`, {
        method: 'post',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId: fileContent[i].postName,
          accessToken: localStorage.getItem('accessToken'),
        }),
      });
      if (resp.status !== 200) {
        console.log(`Failed to save post: ${fileContent[i].postName}`);
      }
      if (resp.status === 401) {
        localStorage.setItem('tokenExpired', true);
        return loginWithReddit();
      }

      console.log('Saved ', fileContent[i].postName);
    }
    setLoadingPosts(false);
    setFileContent('');
    window.location.reload(false);
  }, [fileContent]);

  useEffect(() => {
    if (fileContent) {
      confirmAlert({
        title: 'Confirm to submit',
        message: `Are you sure you want to save ${fileContent.length} posts?`,
        buttons: [
          {
            label: 'Yes',
            onClick: handleSaveImportedPosts,
          },
          {
            label: 'No',
            onClick: () => setFileContent(''),
          },
        ],
      });
    }
  }, [fileContent, handleSaveImportedPosts]);

  const clearAllFilters = () => {
    setSearchParam('');
    setSelectedFilters([]);
  };

  const logout = () => {
    setLoggedIn(false);
    setName(undefined);
    setData([]);
    setSubredditFiltered([]);
    setSelectedFilters([]);
    setSearchParam('');
    setSavedPostsBySubreddit(new Map());
    setLoadingPosts(false);
    localStorage.clear();
  };

  const clearAllSelections = () => {
    setSelectedPosts([]);
  };

  const selectAll = () => {
    const postsToSelect = postsToDisplay.map((post) => post.data.name);

    const notAlreadySelected = postsToSelect.filter(
      (name) => !selectedPosts.includes(name)
    );
    setSelectedPosts(selectedPosts.concat(notAlreadySelected));
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
    if (postsToDisplay && postsToDisplay.length > 0) {
      let i = postsToDisplay.length;
      postsToDisplay.forEach((post) => {
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
        i--;
      });
    }

    return cols;
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
        {!loggedIn && (
          <Row className={'mb-3'}>
            <Col style={{ color: '#b5b5b5' }}>
              <h4 className={'mb-0'}>👉 Easily manage your saved posts</h4>
              <h4 className={'mb-0'}>👉 Unsave multiple posts at once</h4>
              <h4 className={'mb-0'}>👉 Search for any keyword</h4>
              <h4 className={'mb-0'}>👉 No data is stored</h4>
            </Col>
          </Row>
        )}
        <Row>
          <Col>
            <HeaderComp
              loadingPosts={loadingPosts}
              loggedIn={loggedIn}
              loginFn={loginWithReddit}
              noPosts={data && data.length}
              exportAsJson={exportAsJson}
              readFile={readFile}
              fileRef={fileRef}
            />
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
              <SubredditFilters
                subreddits={Array.from(savedPostsBySubreddit.keys())}
                data={savedPostsBySubreddit}
                onToggleFilter={onToggleFilter}
                activeFilters={selectedFilters}
              />
            </Col>
          </Row>

          <Row className="mx-auto mb-3">
            <Col>
              <Button
                variant="primary"
                onClick={selectAll}
                disabled={selectedPosts.length === data.length}
              >
                Select all
              </Button>
              <Button
                variant="primary"
                className="ml-3"
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
                {selectedPosts.length > 0
                  ? `Unsave ${selectedPosts.length} posts`
                  : 'Unsave selected'}
              </Button>
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
            {getCards().map((col) => col)}
          </Masonry>
        </Container>
      )}
    </div>
  );
}
