import './App.css';
import { BrowserRouter, Route } from 'react-router-dom';
import { MainPageWithContext } from '../MainPageWithContext';
function App() {
  return (
    <div>
      <BrowserRouter>
        <Route path="/" exact component={MainPageWithContext} />
      </BrowserRouter>
    </div>
  );
}

export default App;
