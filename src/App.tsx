import React from 'react';
import axios from 'axios';
import styled from 'styled-components';
import {ReactComponent as Check} from './check.svg';

const StyledContainer = styled.div`
    height: 100vw;
    padding: 20px;
    background: #83a4d4;
    background: linear-gradient(to left, #b6fbff, #83a4d4);
    color: #171212;
`;
const StyledHeadlinePrimary = styled.h1`
    font-size: 48px;
    font-weight: 300;
    letter-spacing: 2px;
`;
const StyledItem = styled.div`
    display: flex;
    align-items: center;
    padding-bottom: 5px;
`;
const StyledColumn = styled.span`
    padding: 0 5px;
    white-space: nowrap;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;

    a {
        color: inherit;
    }

    width: ${props => props.width};
`;
const StyledButton = styled.button`
    background: transparent;
    border: 1px solid #171212;
    padding: 5px;
    cursor: pointer;
    transition: all 0.1s ease-in;

    &:hover {
        background: #171212;
        color: #ffffff;
    }

    &:hover {
        background: #171212;
        color: #ffffff;
    }
`;
const StyledButtonSmall = styled(StyledButton)`
    padding: 5px;
`;
const StyledButtonLarge = styled(StyledButton)`
    padding: 10px;
`;
const StyledSearchForm = styled.form`
    padding: 10px 0 20px 0;
    display: flex;
    align-items: baseline;
`;
const StyledLabel = styled.label`
    padding-left: 5px;
    font-size: 24px;
`;
const StyledInput = styled.input`
    border: none;
    background-color: transparent;
    font-size: 24px;
`;

type Story = {
    objectID: string;
    url: string;
    title: string;
    author: string;
    num_comments: number;
    points: number;
};
type Stories = Array<Story>;
type ListProps = {
    list: Stories;
    onRemoveItem: (item: Story) => void;
};
type StoriesState = {
    data: Stories;
    isLoading: boolean;
    isError: boolean;
};
type StoriesAction =
    | StoriesFetchInitAction
    | StoriesFetchSuccessAction
    | StoriesFetchFailureAction
    | StoriesRemoveAction;

interface StoriesFetchInitAction {
    type: 'STORIES_FETCH_INIT';
}

interface StoriesFetchSuccessAction {
    type: 'STORIES_FETCH_SUCCESS';
    payload: Stories;
}

interface StoriesFetchFailureAction {
    type: 'STORIES_FETCH_FAILURE';
}

interface StoriesRemoveAction {
    type: 'REMOVE_STORY';
    payload: Story;
}

const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query=';
const getSumComments = stories => {
    console.log('C');
    return stories.data.reduce(
        (result, value) => result + value.num_comments,
        0
    );
};

const App = () => {

    const storiesReducer = (state: StoriesState, action: StoriesAction) => {
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


    const isMounted = React.useRef(false);
    const [searchTerm, setSearchTerm] = React.useState(localStorage.getItem('search') || 'React');
    // const [stories, setStories] = React.useState([]);
    React.useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;
        } else {
            console.log('77777777777');
            localStorage.setItem('search', searchTerm);
        }

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
    const sumComments = React.useMemo(() => getSumComments(stories), [
        stories,
    ]);

    const handleSearchInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };
    const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        setUrl(`${API_ENDPOINT}${searchTerm}`);
        event.preventDefault();
    };


    const handleRemoveStory = item => {
        dispatchStories({
            type: 'REMOVE_STORY',
            payload: item,
        });
    };

    console.log('B:App');
    return (<StyledContainer>
            <StyledHeadlinePrimary>My Hacker Stories with {sumComments} comments.</StyledHeadlinePrimary>
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


        </StyledContainer>
    );
};

type SearchFormProps = {
    searchTerm: string;
    onSearchInput: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onSearchSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};


const SearchForm = ({
                        searchTerm,
                        onSearchInput,
                        onSearchSubmit,
                    }: SearchFormProps) => (
    <StyledSearchForm onSubmit={onSearchSubmit}>
        <InputWithLabel
            id="search"
            value={searchTerm}
            isFocused
            onInputChange={onSearchInput}
        >
            <strong>Search:</strong>
        </InputWithLabel>
        <StyledButtonLarge type="submit" disabled={!searchTerm}>
            Submit
        </StyledButtonLarge>
    </StyledSearchForm>
);

const List = ({list, onRemoveItem}: ListProps) =>
    <>
        {list.map(item => (
            <Item
                key={item.objectID}
                item={item}
                onRemoveItem={onRemoveItem}
            />
        ))}
    </>

type InputWithLabelProps = {
    id: string;
    value: string;
    type?: string;
    onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    isFocused?: boolean;
    children: React.ReactNode;
};


const InputWithLabel = ({
                            id, value, type = 'text', onInputChange, children, isFocused
                        }: InputWithLabelProps) => {
    // A
    const inputRef = React.useRef<HTMLInputElement>(null!);
    // C
    React.useEffect(() => {
        if (isFocused && inputRef.current) {
            // D
            inputRef.current.focus();
        }
    }, [isFocused]);

    return (<>
        <StyledLabel htmlFor={id}>{children}</StyledLabel>
        &nbsp;
        <StyledInput
            id={id}
            ref={inputRef}
            type={type}
            value={value}
            onChange={onInputChange}
        />
    </>)
};

type ItemProps = {
    item: Story;
    onRemoveItem: (item: Story) => void;
};


const Item = ({item, onRemoveItem}: ItemProps) => (
    <StyledItem>
        <StyledColumn width="40%">
            <a href={item.url}>{item.title}</a>
        </StyledColumn>
        <StyledColumn width="30%">{item.author}</StyledColumn>
        <StyledColumn width="10%">{item.num_comments}</StyledColumn>
        <StyledColumn width="10%">{item.points}</StyledColumn>
        <StyledColumn width="10%">
            <StyledButtonSmall
                type="button" onClick={() => onRemoveItem(item)}
            >
                <Check height="18px" width="18px"/>
            </StyledButtonSmall>
        </StyledColumn>
    </StyledItem>
);

export default App;

