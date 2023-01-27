import React, { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './CreateReport.scss';

import TechnologySearchInput from './TechnologySearchInput/TechnologySearchInput';
import ReportDescription from './ReportDescription/ReportDescription';
import ReportOptions from './ReportOptions/ReportOptions';

import useScrollToTopHook from '../../../customHooks/useScrollToTopHook';

import LoadingIndicator from '../../LoadingIndicator/LoadingIndicator';

import { getSearchedTechnologies, selectTechnology, setIncludedWebsitesCount, updateSelectedOptionData, getSearchedIndustries, getSearchedTechnologiesForSelect, getSearchedLocations, buildNewReport } from '../../../redux/actions/createReportActions';
import { openNotificationSnackbar } from '../../../redux/actions/notificationSnackbarActions';

const CreateReport = ({ location }) => {
    const scrollToTopHook = useScrollToTopHook();
    const dispatch = useDispatch();
    const user = useSelector(store => store.user);
    const createReport = useSelector(store => store.createReport);

    useEffect(() => {
        if(location.state) {
            dispatch(selectTechnology(location.state.selectedTechnology));
            location.state.selectedOptions.forEach(option => dispatch(updateSelectedOptionData(option.key, option.value)));
        };
        return () => dispatch({ type: 'RESET_CREATE_REPORT' })
    }, []);

    return(
        <div className="createReportContainer">
            <p>Web Technology Lead Generation</p>
            <div>
                <p>Choose a technology to target</p>
                <TechnologySearchInput
                    createReport={createReport}
                    getSearchedTechnologies={useCallback(value => dispatch(getSearchedTechnologies(value)), [])}
                    selectTechnology={useCallback(technology => dispatch(selectTechnology(technology)), [])}
                />
                <div></div>
                <div>Start here</div>
            </div>
            {
                !createReport.selectedTechnology.id ?
                    <div className='createReportWithoutData'>
                        <div>
                            <p>What do I Get?</p>
                            <p>A spreadsheet, containing a list of websites that our engine found to be using a technology of your choice and matching your selected criteria.</p>
                        </div>
                        <p>Targeting Options</p>
                    </div>
                :
                    <div className='createReportWithData'>
                        <ReportOptions
                            user={user}
                            createReport={createReport}
                            includedWebsitesCount={createReport.includedWebsitesCount}
                            setIncludedWebsitesCount={value => dispatch(setIncludedWebsitesCount(value))}
                            updateSelectedOptionData={(changedOptionKey, value) => dispatch(updateSelectedOptionData(changedOptionKey, value))}
                            getSearchedIndustries={inputValue => dispatch(getSearchedIndustries(inputValue, createReport.selectedTechnology.technology_key))}
                            getSearchedTechnologiesForSelect={inputValue => dispatch(getSearchedTechnologiesForSelect(inputValue))}
                            getSearchedLocations={inputValue => dispatch(getSearchedLocations(inputValue))}
                            buildNewReport={() => dispatch(buildNewReport())}
                            openNotificationSnackbar={message => dispatch(openNotificationSnackbar(message))}
                        />
                        <ReportDescription 
                            user={user}
                            createReport={createReport}
                            includedWebsitesCount={createReport.includedWebsitesCount}
                            buildNewReport={() => dispatch(buildNewReport())}
                            openNotificationSnackbar={message => dispatch(openNotificationSnackbar(message))}
                        />
                    </div>
            }
            <LoadingIndicator state={createReport.selectedTechnology.id && createReport.isLoading || false} />
        </div>
    )
}

export default CreateReport