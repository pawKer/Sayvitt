import { FileContextProvider } from '../context/FileContextProvider';
import { RedditContextProvider } from '../context/RedditContextProvider';
import { MainPage } from './MainPage';

export const MainPageWithContext = () => {
  return (
    <RedditContextProvider>
      <FileContextProvider>
        <MainPage />
      </FileContextProvider>
    </RedditContextProvider>
  );
};
