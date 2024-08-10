import React from 'react';
import axios from 'axios';


const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query=';

const App = () => {
    const initialStories = [{
        title: 'React', url: 'https://reactjs.org/', author: 'Jordan Walke', num_comments: 3, points: 4, objectID: 0,
    }, {
        title: 'Redux',
        url: 'https://redux.js.org/',
        author: 'Dan Abramov, Andrew Clark',
        num_comments: 2,
        points: 5,
        objectID: 1,
    },];
    const storiesReducer = (state, action) => {
        switch (action.type) {
            case 'STORIES_FETCH_INIT':
                return {
                    ...state,
                    isLoading: true,
                    isError: false,
                };
            case 'STORIES_FETCH_SUCCESS':
                return {
                    ...state,
                    isLoading: false,
                    isError: false,
                    data: action.payload,
                };
            case 'STORIES_FETCH_FAILURE':
                return {
                    ...state,
                    isLoading: false,
                    isError: true,
                };
            case 'REMOVE_STORY':
                return {
                    ...state,
                    data: state.data.filter(
                        story => action.payload.objectID !== story.objectID
                    ),
                };
            default:
                throw new Error();
        }
    };

    const [stories, dispatchStories] = React.useReducer(
        storiesReducer,
        {data: [], isLoading: false, isError: false}
    );


    const [searchTerm, setSearchTerm] = React.useState(localStorage.getItem('search') || 'React');
    // const [stories, setStories] = React.useState([]);
    React.useEffect(() => {
        localStorage.setItem('search', searchTerm);
    }, [searchTerm]);

    const [url, setUrl] = React.useState(
        `${API_ENDPOINT}${searchTerm}`
    );

    const handleFetchStories = React.useCallback(() => {
        dispatchStories({type: 'STORIES_FETCH_INIT'});
        axios.get(url)
            .then(result => {
                dispatchStories({
                    type: 'STORIES_FETCH_SUCCESS',
                    payload: result.data.hits,
                });
            })
            .catch(() =>
                dispatchStories({type: 'STORIES_FETCH_FAILURE'})
            );
    }, [url]);

    React.useEffect(() => {
        handleFetchStories(); // C
    }, [handleFetchStories]);


    const handleSearchInput = event => {
        setSearchTerm(event.target.value);
    };
    const handleSearchSubmit = (event) => {
        setUrl(`${API_ENDPOINT}${searchTerm}`);
        event.preventDefault();
    };


    const handleRemoveStory = item => {
        dispatchStories({
            type: 'REMOVE_STORY',
            payload: item,
        });
    };


    return (<div>
            <h1>{searchTerm}</h1>
            <SearchForm
                searchTerm={searchTerm}
                onSearchInput={handleSearchInput}
                onSearchSubmit={handleSearchSubmit}
            />

            {stories.isError ? (
                <p>Something went wrong ...</p>
            ) : <p>
            </p>}
            {stories.isLoading ? (
                <p>Loading ...</p>
            ) : (
                <List
                    list={stories.data}
                    onRemoveItem={handleRemoveStory}
                />
            )
            }


        </div>
    );
};

const SearchForm = ({
                        searchTerm,
                        onSearchInput,
                        onSearchSubmit,
                    }) => (
    <form onSubmit={onSearchSubmit}>
        <InputWithLabel
            id="search"
            value={searchTerm}
            isFocused
            onInputChange={onSearchInput}
        >
            <strong>Search:</strong>
        </InputWithLabel>
        <button type="submit" disabled={!searchTerm}>
            Submit
        </button>
    </form>
);

const List = ({
                  list, onRemoveItem
              }) =>
    list.map(item => (
        <Item
            key={item.objectID}
            item={item}
            onRemoveItem={onRemoveItem}
        />
    ));


const InputWithLabel = ({
                            id, label, value, type = 'text', onInputChange, children, isFocused
                        }) => {
    // A
    const inputRef = React.useRef();
    // C
    React.useEffect(() => {
        if (isFocused && inputRef.current) {
            // D
            inputRef.current.focus();
        }
    }, [isFocused]);

    return (<>
        <label htmlFor={id}>{children}</label>
        &nbsp;
        <input
            id={id}
            ref={inputRef}
            type={type}
            value={value}
            onChange={onInputChange}
        />
    </>)
};

const Item = ({item, onRemoveItem}) => {
    return (
        <div>
            <span>
                <a href={item.url}>{item.title}</a>
            </span>
            <span>{item.author}</span>
            <span>{item.num_comments}</span>
            <span>{item.points}</span>
            <span>
                <button type="button" onClick={onRemoveItem.bind(null, item)}>
                    Dismiss
                </button>
            </span>
        </div>
    );
};

export default App;

