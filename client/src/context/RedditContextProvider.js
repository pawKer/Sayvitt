import { createContext, useState, useEffect } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { formatSavedPostsBySubreddit } from '../utils/formatPostsBySubreddit';
import { openDeleteSavedModal } from '../utils/openDeleteSavedModal';

export const RedditContext = createContext({});

export const RedditContextProvider = ({ children }) => {
  const [data, setData] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [postsToDisplay, setPostsToDisplay] = useState([]);
  const locationz = useLocation();
  const history = useHistory();
  const [code, setCode] = useState();
  const [name, setName] = useState();
  const [subredditFiltered, setSubredditFiltered] = useState([]);
  const [savedPostsBySubreddit, setSavedPostsBySubreddit] = useState(new Map());
  const [loggedIn, setLoggedIn] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [searchParam, setSearchParam] = useState('');

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
  }, [code, data.length, history, locationz.search]);

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
    setSavedPostsBySubreddit(formatSavedPostsBySubreddit(responseData));
    setLoadingPosts(false);
  };

  const clearAllSelections = () => {
    setSelectedPosts([]);
  };

  const submitDeleteSelectedSavedHandler = () => {
    openDeleteSavedModal(selectedPosts.length, handleOnClickDeleteAllSelected);
  };

  const selectAll = () => {
    const postsToSelect = postsToDisplay.map((post) => post.data.name);

    const notAlreadySelected = postsToSelect.filter(
      (name) => !selectedPosts.includes(name)
    );
    setSelectedPosts(selectedPosts.concat(notAlreadySelected));
  };

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

      await resp.json();
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

  return (
    <RedditContext.Provider
      value={{
        data,
        selectedFilters,
        setSelectedFilters,
        postsToDisplay,
        setPostsToDisplay,
        name,
        subredditFiltered,
        setSubredditFiltered,
        searchParam,
        setSearchParam,
        savedPostsBySubreddit,
        selectedPosts,
        setSelectedPosts,
        loggedIn,
        loadingPosts,
        setLoadingPosts,
        loginWithReddit,
        clearAllFilters,
        logout,
        selectAll,
        clearAllSelections,
        submitDeleteSelectedSavedHandler,
      }}
    >
      {children}
    </RedditContext.Provider>
  );
};
