export type ActionTypes = 'SET' | 'UPDATE' | 'DELETE';

export interface Action {
    type: ActionTypes,
    payload?: any;
}

export const SET = () => (
    {
        type: 'SET',
    } as Action
)

export const DELETE = (payload: string) => (
    {
        type: 'DELETE',
        payload: payload
    } as Action
)

export const UPDATE = (payload: any) => (
    {
        type: 'UPDATE',
        payload: payload
    } as Action
)
