import React from 'react';


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

    const getAsyncStories = () =>
        new Promise((resolve, reject) => setTimeout(
            () => resolve({data: {stories: initialStories}}),
            2000
        ));
    const [searchTerm, setSearchTerm] = React.useState(localStorage.getItem('search') || 'React');
    // const [stories, setStories] = React.useState([]);
    React.useEffect(() => {
        localStorage.setItem('search', searchTerm);
    }, [searchTerm]);
    const handleSearch = event => {
        setSearchTerm(event.target.value);
    };
    const searchedStories = stories.data.filter(story => story.title.includes(searchTerm))


    React.useEffect(() => {
        dispatchStories({type: 'STORIES_FETCH_INIT'});
        getAsyncStories().then(result => {
            dispatchStories({
                type: 'STORIES_FETCH_SUCCESS',
                payload: result.data.stories,
            });
        }).catch(() =>
            dispatchStories({type: 'STORIES_FETCH_FAILURE'})
        );
        ;
    }, []);


    const handleRemoveStory = item => {
        dispatchStories({
            type: 'REMOVE_STORY',
            payload: item,
        });
    };


    return (<div>
        <h1>{searchTerm}</h1>
        <InputWithLabel
            id="search"
            value={searchTerm}
            isFocused
            onInputChange={handleSearch}
        >
            Search
        </InputWithLabel>
        {stories.isError ? (
            <p>Something went wrong ...</p>
        ) : <p>
        </p>}
        {stories.isLoading ? (
            <p>Loading ...</p>
        ) : (
            <List
                list={searchedStories}
                onRemoveItem={handleRemoveStory}
            />
        )
        }


    </div>);
};

const List = ({list, onRemoveItem}) =>
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

