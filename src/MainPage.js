import { useEffect, useState } from 'react';
import logo from './logo.svg';
import { useLocation } from "react-router-dom";
export function MainPage() {
    const [token, setToken] = useState('')
    const [accessToken, setAccessToken] = useState('')
    const [name, setName] = useState('')
    useEffect(() => {
        console.log("Hellp")
        if (token !== '') {
            window.location.replace(`https://www.reddit.com/api/v1/authorize?client_id=${process.env.REACT_APP_REDDIT_API_USER}&response_type=code&state=${Math.random().toString(36).substring(2)}&redirect_uri=${process.env.REACT_APP_URI}&duration=temporary&scope=identity,history`)
        } 
        
    }, [])
    const locationz = useLocation();

    useEffect(() => {

        const searchParams = new URLSearchParams(locationz.search);
        console.log(searchParams.get('code'))
        setToken(searchParams.get('code'))
    }, [locationz]);

    useEffect(() => {
            console.log(token, 'TOKEN CHANGED')
            if(token) {
                let headers = new Headers();
                headers.append('Authorization', 'Basic ' + btoa(process.env.REACT_APP_REDDIT_API_USER + ":" + process.env.REACT_APP_REDDIT_API_SECRET));
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
            
        </div>
    )
}