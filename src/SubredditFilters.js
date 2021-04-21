import Button from 'react-bootstrap/Button';
export function SubredditFilters(props) {
    let list = []
    console.log(props.data)
    props.subreddits.forEach(sub => {
        list.push(<Button key={sub} variant={props.activeFilters.includes(sub) ? "secondary" : "light"} className="mx-2 my-2" onClick={() => props.onToggleFilter(sub)}>r/{sub} ({props.data.get(sub).posts.length})</Button>)
    })
    return list;
}