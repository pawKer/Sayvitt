import './App.css';
import { BrowserRouter, Route } from 'react-router-dom';
import { MainPage } from './MainPage';
function App() {
  // const [location, setLocation] = useState(useLocation())

  return (
    <div>
      <BrowserRouter>
        <Route path="/" exact component={MainPage} />
      </BrowserRouter>
    </div>
  );
}

export default App;
