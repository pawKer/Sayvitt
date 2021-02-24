import { useEffect, useState } from 'react';
import { useLocation } from "react-router-dom";
import Spinner from 'react-bootstrap/Spinner';
export function MainPage() {
    const [token, setToken] = useState(localStorage.getItem("token"))
    const [accessToken, setAccessToken] = useState(localStorage.getItem("accessToken"))
    const [name, setName] = useState('')
    const [data, setData] = useState([])
    const [loadingPosts, setLoadingPosts] = useState(true)
    const [savedPostsBySubreddit, setSavedPostsBySubreddit] = useState(new Map())
    const locationz = useLocation();
    useEffect(() => {
        console.log("Hellp")
        console.log(token)
        const searchParams = new URLSearchParams(locationz.search);
        if (!token && !searchParams.get('code')) {
            let redirect_url = `https://www.reddit.com/api/v1/authorize?client_id=${process.env.REACT_APP_REDDIT_API_USER}&response_type=code&state=${Math.random().toString(36).substring(2)}&redirect_uri=${process.env.REACT_APP_URI}&duration=temporary&scope=identity,history`
            console.log(redirect_url)
            window.location.replace(redirect_url)
        } 
        if(searchParams.get('code')){
            setToken(searchParams.get('code'))
            localStorage.setItem("token", searchParams.get('code'))
        }
    }, [])

    useEffect(() => {
            console.log(token, 'TOKEN CHANGED')
            if(token && !accessToken) {
                let headers = new Headers();
                headers.set('Authorization', 'Basic ' + btoa(process.env.REACT_APP_REDDIT_API_USER + ":" + process.env.REACT_APP_REDDIT_API_SECRET));
                console.log(headers)
                fetch(`https://www.reddit.com/api/v1/access_token`, {
                    method: 'post',
                    headers: new Headers({
                        'Authorization': `Basic ${btoa(`${process.env.REACT_APP_REDDIT_API_USER}:${process.env.REACT_APP_REDDIT_API_SECRET}`)}`,
                    }),
                    body: new URLSearchParams({
                        'code': token,
                        'redirect_uri': process.env.REACT_APP_URI,
                        'grant_type': 'authorization_code'
                    }),
                }).then((res) => res.json())
                .then(data => {
                    console.log(data)
                    setAccessToken(data.access_token)
                    localStorage.setItem("accessToken", data.access_token)
                })
                .catch((err) => {
                    console.log(err)
                })
            }
    }, [token])

    useEffect(() => {
        // NOW USE THE TOKEN TO GET DATA
        console.log(accessToken, "YEEEEE")
        if(accessToken) {
            fetch('https://oauth.reddit.com/api/v1/me', {
                method: 'get', 
                headers: new Headers({
                    'Authorization': `bearer ${accessToken}`,
                    'User-Agent': 'web:com.sayvitt:1.0.0 (by /u/raresdn)'
                })
            }).then((res) => res.json())
            .then(data => {
                setName(data.name)
                console.log(data)
            })
            .catch((err) => {
                console.log(err)
            })
        }
    }, [accessToken])

    useEffect(() => {
        if(name && (!data || data.length === 0)) {
            console.log('nameeeeeee', name)
            fetch(`https://oauth.reddit.com/user/${name}/saved/.json?limit=100`, {
                method: 'get', 
                headers: new Headers({
                    'Authorization': `bearer ${accessToken}`,
                    'User-Agent': 'web:com.sayvitt:1.0.0 (by /u/raresdn)'
                })
            }).then((res) => res.json())
            .then(data => {
                setData(data.data.children)
                setLoadingPosts(false)
                console.log(data)
                formatSavedPostsBySubreddit(data.data.children)
            })
        }
    }, [name])
    const returnSavedPosts = (data) => {
        let items = []
        if(data && data.length > 0) {
            data.forEach((post) => {
                items.push(<li key={post.data.url} ><a href={`http://reddit.com${post.data.permalink}`}>{post.data.title}</a></li>)
            })
            return items
        }
        return []
        
    }

    const formatSavedPostsBySubreddit = (data) => {
        let items = new Map()
        if(data && data.length > 0) {
            data.forEach((post) => {
                
                if(items.has(post.data.subreddit)){
                    items.get(post.data.subreddit).posts.push({
                        url: post.data.permalink,
                        title: post.data.title
                    })
                } else {
                    items.set(post.data.subreddit, {posts: []})
                    items.get(post.data.subreddit).posts.push({
                        url: post.data.permalink,
                        title: post.data.title
                    })
                }
            })
            setSavedPostsBySubreddit(items)
        }
        console.log(items)
    }

    const returnSavedPostsBySubreddit = (data) => {
        let items = []
        let keyArray = Array.from(data.keys())
        keyArray.forEach(subreddit => {
            items.push(
                <li key={subreddit}>{subreddit} ({data.get(subreddit).posts.length} posts)</li>
            )
            // items.push(<ol style="list-style-type: lower-alpha; padding-bottom: 0;"></ol>)
            // data.get(subreddit).forEach(post => {
            //     items.push(<li key={post.url} ><a href={`http://reddit.com${post.url}`}>{post.title}</a></li>)
                
            // })
            // items.push(</ol>)
        })
        return items;
    }


    return (
        <div className="App">
            <div>
                {name && <h1>Hello, {name}</h1>}
                {loadingPosts ? (
                    <Spinner animation="border" role="status">
                        <span className="sr-only">Loading...</span>
                    </Spinner>
                )
                    :
                    <h3>Your saved posts: </h3>
                }
            </div>
            <ul>
                {data && 
                    returnSavedPosts(data)
                }
            </ul>

            <ul>
                {
                    savedPostsBySubreddit &&
                        returnSavedPostsBySubreddit(savedPostsBySubreddit)
                }
            </ul>
        </div>

    )
}