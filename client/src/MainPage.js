import { useEffect, useState } from 'react';
import { useLocation, useHistory } from 'react-router-dom';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { SubredditFilters } from './SubredditFilters';
import { PostCards } from './PostCards';
import { HeaderComp } from './HeaderComp';
import { confirmAlert } from 'react-confirm-alert';
import Button from 'react-bootstrap/Button';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { CardColumns } from 'react-bootstrap';

export function MainPage() {
  const [code, setCode] = useState();
  const [accessToken, setAccessToken] = useState();
  const [loggedIn, setLoggedIn] = useState(false);
  const [name, setName] = useState('');
  const [data, setData] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [savedPostsBySubreddit, setSavedPostsBySubreddit] = useState(new Map());
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [selectedPosts, setSelectedPosts] = useState([]);
  const locationz = useLocation();
  const history = useHistory();

  const onToggleFilter = (fil) => {
    if (selectedFilters.includes(fil)) {
      setSelectedFilters(selectedFilters.filter((e) => e !== fil));
    } else {
      setSelectedFilters(selectedFilters.concat(fil));
    }
  };

  useEffect(() => {
    console.log(data);
    console.log(localStorage.getItem('accessToken'));
    console.log(localStorage.getItem('tokenExpired'));
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
          console.log('KKKK', token);
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
    console.log(redirect_url);
    localStorage.setItem('redirected', true);
    window.location.replace(redirect_url);
  };

  const getAccessToken = async (codeParam) => {
    console.log(codeParam);
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
        console.log(data);
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
    console.log(accessTokenParam, 'YEEEEE');
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
    setLoadingPosts(false);
  };

  const formatSavedPostsBySubreddit = (data) => {
    let items = new Map();
    if (data && data.length > 0) {
      data.forEach((post) => {
        if (items.has(post.data.subreddit)) {
          items.get(post.data.subreddit).posts.push({
            url: post.data.permalink,
            title: post.data.title,
          });
        } else {
          items.set(post.data.subreddit, { posts: [] });
          items.get(post.data.subreddit).posts.push({
            url: post.data.permalink,
            title: post.data.title,
          });
        }
      });
      setSavedPostsBySubreddit(items);
    }
  };

  const handleCheckBox = (e, id) => {
    console.log('Event ', e, id);
    if (!selectedPosts.includes(id)) {
      setSelectedPosts(selectedPosts.concat(id));
    } else {
      setSelectedPosts(selectedPosts.filter((e) => e !== id));
    }
    console.log(selectedPosts);
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
      console.log(respJson);
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
    setSavedPostsBySubreddit(new Map());
    setLoadingPosts(false);
    localStorage.clear();
  };

  const clearAllSelections = () => {
    setSelectedPosts([]);
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
        ></HeaderComp>
      </div>
      {data.length > 0 && (
        <Container fluid>
          <Row>
            <Button
              variant="primary"
              className="mx-3 my-3"
              onClick={clearAllFilters}
              disabled={!(selectedFilters.length > 0)}
            >
              Clear all filters
            </Button>
          </Row>
          <Row>
            <Col>
              <SubredditFilters
                subreddits={Array.from(savedPostsBySubreddit.keys())}
                data={savedPostsBySubreddit}
                onToggleFilter={onToggleFilter}
                activeFilters={selectedFilters}
              />
            </Col>
          </Row>
          <Row>
            <Button
              variant="primary"
              className="mx-3 my-3"
              onClick={clearAllSelections}
              disabled={!(selectedPosts.length > 0)}
            >
              Clear selections
            </Button>
            <Button
              variant="danger"
              className="mx-3 my-3"
              onClick={submitDeleteSelectedSaved}
              disabled={!(selectedPosts.length > 0)}
            >
              Unsave selected
            </Button>
          </Row>
          <CardColumns>
            <PostCards
              data={data}
              handleCheckBox={handleCheckBox}
              selectedFilters={selectedFilters}
              selectedPosts={selectedPosts}
            />
          </CardColumns>
        </Container>
      )}
    </div>
  );
}
