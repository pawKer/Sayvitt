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
    return fetch(`http://localhost:5000/api/v1/accessToken`, {
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
    return fetch('http://localhost:5000/api/v1/getProfile', {
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
    let resp = await fetch(`http://localhost:5000/api/v1/getSavedPosts`, {
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

  const returnSavedPosts = (data) => {
    let items = [];
    if (data && data.length > 0) {
      data.forEach((post) => {
        items.push(
          <li key={post.data.url}>
            <a href={`http://reddit.com${post.data.permalink}`}>
              {post.data.title}
            </a>
          </li>
        );
      });
      return items;
    }
    return [];
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

  const returnSavedPostsBySubreddit = (data) => {
    let items = [];
    let keyArray = Array.from(data.keys());
    keyArray.forEach((subreddit) => {
      items.push(
        <li key={subreddit}>
          {subreddit} ({data.get(subreddit).posts.length} posts)
        </li>
      );
    });
    return items;
  };

  const handleCheckBox = (id) => {
    console.log('Event ', id);
    if (selectedPosts.includes(id)) {
      setSelectedPosts(selectedPosts.filter((e) => e !== id));
    } else {
      setSelectedPosts(selectedPosts.concat(id));
    }
    console.log(selectedPosts);
  };

  const handleOnClickDeleteAllSelected = (e) => {
    // TODO: UPDATE TO USE API
    // selectedPosts.forEach(async (postId) => {
    //   let resp = await fetch(
    //     `https://oauth.reddit.com/api/unsave?id=${postId}`,
    //     {
    //       method: 'post',
    //       headers: new Headers({
    //         Authorization: `bearer ${localStorage.getItem('accessToken')}`,
    //         'User-Agent': 'web:com.sayvitt:1.0.0 (by /u/raresdn)',
    //       }),
    //     }
    //   );
    //   let respJson = await resp.json();
    //   console.log('Deleted ', postId);
    // });
    // let newData = data;
    // selectedPosts.forEach((postId) => {
    //   newData = newData.filter((item) => item.data.name !== postId);
    // });
    // setData(newData);
    // formatSavedPostsBySubreddit(newData);
    // setSelectedPosts([]);
    // clearAllFilters();
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

  return (
    <div className="App">
      <div>
        {name ? (
          <h1>
            Hello, <i>{name}</i>!
          </h1>
        ) : (
          <h1>Hello!</h1>
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
            />
          </CardColumns>
        </Container>
      )}
      {/* <ul>
                {data && 
                    returnSavedPosts(data)
                }
            </ul> */}

      {/* <ul>
                {
                    savedPostsBySubreddit &&
                        returnSavedPostsBySubreddit(savedPostsBySubreddit)
                }
            </ul> */}
    </div>
  );
}
