import { useEffect, useState } from 'react';
import logo from './logo.svg';
import { useLocation } from "react-router-dom";
export function MainPage() {
    const [token, setToken] = useState(localStorage.getItem("token"))
    const [accessToken, setAccessToken] = useState(localStorage.getItem("accessToken"))
    const [name, setName] = useState('')
    const [data, setData] = useState([])
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
        if(name) {
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
                console.log(data)
            })
        }
    }, [name])
    const returnSavedPosts = (data) => {
        let items = []
        data.forEach((post) => {
            items.push(<li key={post.data.url}>{post.data.title}</li>)
        })
        return items
    }
    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                {name && <h1>Hello, {name}</h1>}
                <p>
                Edit <code>src/App.js</code> and save to reload.
                </p>
                <a
                className="App-link"
                href="https://reactjs.org"
                target="_blank"
                rel="noopener noreferrer"
                >
                Learn React
                </a>
            </header>
            <ul>
                {data && returnSavedPosts(data)}
            </ul>
        </div>

    )
}