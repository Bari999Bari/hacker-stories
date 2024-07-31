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
    const getAsyncStories = () => {
        return new Promise(resolve =>
            setTimeout(
                () => resolve({data: {stories: initialStories}}),
                2000
            )
        )
    };
    const [searchTerm, setSearchTerm] = React.useState(localStorage.getItem('search') || 'React');
    const [stories, setStories] = React.useState([]);
    React.useEffect(() => {
        localStorage.setItem('search', searchTerm);
    }, [searchTerm]);
    const handleSearch = event => {
        setSearchTerm(event.target.value);
    };
    const searchedStories = stories.filter(story => story.title.includes(searchTerm))
    const [isLoading, setIsLoading] = React.useState(false);
    const [isError, setIsError] = React.useState(false);

    React.useEffect(() => {
        setIsLoading(true);
        getAsyncStories().then(result => {
            setStories(result.data.stories);
            setIsLoading(false);
        }).catch(() => setIsError(true));
        ;
    }, []);


    const handleRemoveStory = item => {
        const newStories = stories.filter(
            story => item.objectID !== story.objectID
        );
        setStories(newStories);
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
        {isError ? (
            <p>Something went wrong ...</p>
        ) : <p>
            {isLoading ? (
                <p>Loading ...</p>
            ) : (
                <List
                    list={searchedStories}
                    onRemoveItem={handleRemoveStory}
                />
            )
            }</p>}


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

