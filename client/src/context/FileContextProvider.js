import {
  createContext,
  useState,
  useEffect,
  useRef,
  useContext,
  useCallback,
} from 'react';
import { RedditContext } from './RedditContextProvider';
import { confirmAlert } from 'react-confirm-alert';

export const FileContext = createContext({});

export const FileContextProvider = ({ children }) => {
  const fileRef = useRef();
  const [fileContent, setFileContent] = useState('');
  const { data, setLoadingPosts, loginWithReddit } = useContext(RedditContext);

  const exportAsJson = () => {
    let index = data.length;
    const postList = data.map((post) => {
      return {
        index: index--,
        id: post.data.id,
        postName: post.data.name,
        title: post.data.title,
        url: post.data.url,
      };
    });
    const element = document.createElement('a');
    const file = new Blob([JSON.stringify(postList)], {
      type: 'application/json',
    });
    element.href = URL.createObjectURL(file);
    element.download = 'savedPosts.json';
    document.body.appendChild(element);
    element.click();
  };

  const readFile = (event) => {
    const fileReader = new FileReader();
    const { files } = event.target;
    try {
      fileReader.readAsText(files[0], 'UTF-8');
    } catch {
      alert('Imported file is not valid.');
      return;
    }

    fileReader.onload = (e) => {
      const content = e.target.result;
      let jsonContent;
      try {
        jsonContent = JSON.parse(content);
        setFileContent(jsonContent);
      } catch {
        alert('Imported file is not valid JSON.');

        return;
      }
    };
  };

  const handleSaveImportedPosts = useCallback(async () => {
    setLoadingPosts(true);

    for (let i = fileContent.length - 1; i >= 0; i--) {
      console.log(`Save post id: ${fileContent[i].postName}`);
      let resp = await fetch(`/api/v1/savePost`, {
        method: 'post',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId: fileContent[i].postName,
          accessToken: localStorage.getItem('accessToken'),
        }),
      });
      if (resp.status !== 200) {
        console.log(`Failed to save post: ${fileContent[i].postName}`);
      }
      if (resp.status === 401) {
        localStorage.setItem('tokenExpired', true);
        return loginWithReddit();
      }

      console.log('Saved ', fileContent[i].postName);
    }
    setLoadingPosts(false);
    setFileContent('');
    window.location.reload(false);
  }, [fileContent, loginWithReddit, setLoadingPosts]);

  useEffect(() => {
    if (fileContent) {
      confirmAlert({
        title: 'Confirm to submit',
        message: `Are you sure you want to save ${fileContent.length} posts?`,
        buttons: [
          {
            label: 'Yes',
            onClick: handleSaveImportedPosts,
          },
          {
            label: 'No',
            onClick: () => setFileContent(''),
          },
        ],
      });
    }
  }, [fileContent, handleSaveImportedPosts]);
  return (
    <FileContext.Provider
      value={{ fileContent, setFileContent, exportAsJson, readFile, fileRef }}
    >
      {children}
    </FileContext.Provider>
  );
};
