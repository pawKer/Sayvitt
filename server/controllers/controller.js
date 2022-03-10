import fetch from 'node-fetch';
const Controller = () => {
  const getAccesToken = async (req, res) => {
    console.log(req.body.code);
    const auth =
      'Basic ' +
      Buffer.from(
        `${process.env.REDDIT_API_USER}:${process.env.REDDIT_API_SECRET}`
      ).toString('base64');
    const result = await fetch(`https://www.reddit.com/api/v1/access_token`, {
      method: 'post',
      headers: {
        Authorization: auth,
      },
      body: new URLSearchParams({
        code: req.body.code,
        redirect_uri: process.env.REACT_APP_URI,
        grant_type: 'authorization_code',
      }),
    });

    const resData = await result.json();
    if (result.status === 200) {
      const authToken = resData.access_token;
      if (!authToken) {
        return res.status(500).json({ resData });
      }
      console.log(resData);
      return res.status(200).json({ token: authToken });
    } else {
      return res.status(500).json({ resData });
    }
  };

  const getProfile = async (req, res) => {
    if (!req.body.accessToken) {
      return res.status(500).json({ error: 'access token is empty' });
    }

    const result = await fetch('https://oauth.reddit.com/api/v1/me', {
      method: 'get',
      headers: {
        Authorization: `bearer ${req.body.accessToken}`,
        'User-Agent': 'web:com.sayvitt:1.0.0 (by /u/raresdn)',
      },
    });
    if (result.status === 200) {
      const resData = await result.json();
      return res.status(200).json({ data: resData });
    } else if (result.status === 401) {
      return res.status(401).json({ error: 'Unauthorized' });
    } else {
      return res.status(result.status).json({ error: 'Server error' });
    }
  };

  const getSavedPosts = async (req, res) => {
    let data = [];
    let after = null;
    let gotAll = false;
    if (!req.body.name) {
      return res.status(500).json({ error: 'name param is empty' });
    }
    if (!req.body.accessToken) {
      return res.status(500).json({ error: 'access token is empty' });
    }

    while (!gotAll) {
      let resp = await fetch(
        `https://oauth.reddit.com/user/${req.body.name}/saved/.json?after=${after}&limit=100`,
        {
          method: 'get',
          headers: {
            Authorization: `bearer ${req.body.accessToken}`,
            'User-Agent': 'web:com.sayvitt:1.0.0 (by /u/raresdn)',
          },
        }
      );
      let responseData = await resp.json();
      let newData = data;
      newData.push(...responseData.data.children);
      data = newData;
      if (
        responseData.data.children[responseData.data.children.length - 1] ===
        undefined
      ) {
        gotAll = true;
        break;
      }

      let newAfter =
        responseData.data.children[responseData.data.children.length - 1].data
          .name;
      if (newAfter !== after) {
        after = newAfter;
      }
    }
    return res.status(200).json(data);
  };

  const unsavePost = async (req, res) => {
    const postId = req.body.postId;

    if (!postId) {
      return res.status(500).json({ error: 'postId is empty' });
    }

    if (!req.body.accessToken) {
      return res.status(500).json({ error: 'access token is empty' });
    }

    let resp = await fetch(`https://oauth.reddit.com/api/unsave?id=${postId}`, {
      method: 'post',
      headers: {
        Authorization: `bearer ${req.body.accessToken}`,
        'User-Agent': 'web:com.sayvitt:1.0.0 (by /u/raresdn)',
      },
    });

    if (resp.status === 200) {
      const resData = await resp.json();
      return res.status(200).json({ data: resData });
    } else if (resp.status === 401) {
      return res.status(401).json({ error: 'Unauthorized' });
    } else {
      return res.status(resp.status).json({ error: 'Server error' });
    }
  };

  return {
    getAccesToken,
    getProfile,
    getSavedPosts,
    unsavePost,
  };
};

export default Controller;
