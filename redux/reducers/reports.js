const initialState = {
    isLoading: false,
    allReports: [],
    selectedReport: {},
};

export default function reports(state = initialState, action) {
    switch(action.type) {
        case 'SET_REPORTS_LOADING':
            return { ...state, isLoading: true };
        case 'SET_REPORTS_NOT_LOADING':
            return { ...state, isLoading: false };
        case 'SET_ALL_REPORTS':
            return { ...state, allReports: action.payload, isLoading: false };
        case 'SET_SELECTED_REPORT':
            return { ...state, selectedReport: action.payload };
        case 'REPORTS_ERROR':
            return initialState;
        default:
            return state
    }
}