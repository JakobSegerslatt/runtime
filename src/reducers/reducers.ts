import { Action } from "../actions/actions";

var defaultState = {
    distanceTraveled: 0,
}
export const reducers = (state = defaultState, action: Action) => {
    let next;
    switch (action.type) {
        case 'SET':
            next = action.payload;
            break;
        case 'UPDATE':
            next = { ...state, ...action.payload }
            break;
        case 'DELETE':
            delete state[action.payload];
            next = state;
            break;
        default:
            next = state;
            break;
    }

    return next;
}