import React from 'react';
import { createStore, combineReducers } from 'redux';
import { reducers } from '../reducers/reducers';

export const store = createStore(
    combineReducers({
        info: reducers
    }),
    // window.__REDUX_DEVTOOLS_EXTENSION && window.__REDUX_DEVTOOLS_EXTENSION__()
);