import React, { useState, useEffect, useMemo } from 'react';
import { Link, useRouteMatch, useParams, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import moment from 'moment';
import './Report.scss';

import { makeStyles } from '@material-ui/core/styles';
import MobileStepper from '@material-ui/core/MobileStepper';

import Chart from './Chart/Chart';
import TechUsageTable from '../../TechUsageTable/TechUsageTable';

import useScrollToTopHook from '../../../customHooks/useScrollToTopHook';

import LoadingIndicator from '../../LoadingIndicator/LoadingIndicator';

import { selectReport, deleteReport } from '../../../redux/actions/reportsActions';
import { openNotificationSnackbar } from '../../../redux/actions/notificationSnackbarActions';

import parseReportCSVToTableData from '../../../helpers/parseReportCSVToTableData';
import parseReportCSVAndSendToBackend from '../../../helpers/parseReportCSVAndSendToBackend';
import getAxiosOptions from '../../../helpers/getAxiosOptions';
import getCurrentTimezoneDate from '../../../helpers/getCurrentTimezoneDate';

const useStylesForMobileStepper = makeStyles({
    root: {
        padding: '0',
        width: 140,
        backgroundColor: 'inherit',
    },
});

const useStylesForLinearProgress = makeStyles({
    root: {
        width: '100%',
        backgroundColor: '#B7B7B7',
        height: '9px',
    },
    barColorPrimary: {
        backgroundColor: '#3898DE',
    },
});

const Report = () => {
    const scrollToTopHook = useScrollToTopHook();
    const classesForMobileStepper = useStylesForMobileStepper();
    const classesForLinearProgress = useStylesForLinearProgress();
    const history = useHistory();
    const { id } = useParams();
    const match = useRouteMatch();
    const reportsPageUrl = match.url.slice(0, match.url.lastIndexOf('/'));
    const dispatch = useDispatch();
    const user = useSelector(store => store.user);
    const reports = useSelector(store => store.reports);
    const { selectedReport } = reports;
    const [pageIsLoading, setPageIsLoading] = useState(false);
    const [reportDataInApi, setReportDataInApi] = useState({ leading_industries: [], co_related_technologies: []});
    const [generatedReportData, setGeneratedReportData] = useState(null);

    useEffect(() => {
        dispatch(selectReport(id));
    }, [ reports.allReports.length ]);

    useEffect(() => {
        if(Object.keys(selectedReport).length !== 0) getReportDataFromApi();
    }, [ selectedReport ]);

    const getReportDataFromApi = () => {
        const data = {
            limit: 100,
            offset: 0,
            technology_key: selectedReport.technology_key,
            included_websites_count: selectedReport.included_websites_count,
            included_industries: JSON.parse(selectedReport.included_industries),
            excluded_industries: JSON.parse(selectedReport.excluded_industries),
            included_technologies: selectedReport.included_technologies && JSON.parse(selectedReport.included_technologies).map(technology => technology.name),
            excluded_technologies: selectedReport.excluded_technologies && JSON.parse(selectedReport.excluded_technologies).map(technology => technology.name),
            included_employees_count: JSON.parse(selectedReport.included_employees_count),
            excluded_employees_count: JSON.parse(selectedReport.excluded_employees_count),
            included_locations: JSON.parse(selectedReport.included_locations),
            excluded_locations: JSON.parse(selectedReport.excluded_locations),
        };
        setPageIsLoading(true);
        Promise.all([
            axios.post('/api/get_technology_for_report', data, getAxiosOptions(user.data.authToken)),
            axios.post(`/api/view_report/${selectedReport.id}`, null, getAxiosOptions(user.data.authToken))
        ])
        .then(responses => {
            setReportDataInApi(responses[0].data);
            if(responses[1].data.url) {
                const key = responses[1].data.url.slice(responses[1].data.url.lastIndexOf('/') + 1);
                AWS.config.update({
                    accessKeyId: process.env.MIX_AWS_ACCESS_KEY_ID,
                    secretAccessKey: process.env.MIX_AWS_SECRET_ACCESS_KEY,
                    region: process.env.MIX_AWS_REGION, 
                });
                const s3 = new AWS.S3({
                    signatureVersion: 'v4',
                });
                const params = {Bucket: process.env.MIX_AWS_BUCKET, Key: key};
                const url = s3.getSignedUrl('getObject', params);
                parseReportCSVToTableData(url, csvData => setGeneratedReportData(csvData), () => setPageIsLoading(false));
            }else {
                setPageIsLoading(false);
            };
        })
        .catch(error => {
            console.log(error);
            setPageIsLoading(false);
        });
    };

    const handleDeleteButton = event => {
        dispatch(deleteReport(selectedReport.id, user.data.id))
        .then(() => {
            dispatch(openNotificationSnackbar('Selected report has been deleted'));
            history.push(reportsPageUrl);
        });
    };

    const handleDownloadButtonClick = event => {
        event.persist();
        setPageIsLoading(true);
        axios.post(`/api/view_report/${selectedReport.id}`, null, getAxiosOptions(user.data.authToken))
        .then(response => {
            if(response.data.message) {
                dispatch(openNotificationSnackbar(response.data.message));
                setPageIsLoading(false);
            }else {
                const key = response.data.url.slice(response.data.url.lastIndexOf('/') + 1);
                AWS.config.update({
                    accessKeyId: process.env.MIX_AWS_ACCESS_KEY_ID,
                    secretAccessKey: process.env.MIX_AWS_SECRET_ACCESS_KEY,
                    region: process.env.MIX_AWS_REGION, 
                });
                const s3 = new AWS.S3({
                    signatureVersion: 'v4',
                });
                const params = {Bucket: process.env.MIX_AWS_BUCKET, Key: key};
                const url = s3.getSignedUrl('getObject', params);
                const tempLink = document.createElement('a');
                tempLink.href = url;
                tempLink.click();
                setPageIsLoading(false);
            };
        })
        .catch(error => {
            console.log(error);
            setPageIsLoading(false);
        });
    };

    const handleSendZapierClick = event => {
        const key = selectedReport.report_url.slice(selectedReport.report_url.lastIndexOf('/') + 1);
        AWS.config.update({
            accessKeyId: process.env.MIX_AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.MIX_AWS_SECRET_ACCESS_KEY,
            region: process.env.MIX_AWS_REGION, 
        });
        const s3 = new AWS.S3({
            signatureVersion: 'v4',
        });
        const params = {Bucket: process.env.MIX_AWS_BUCKET, Key: key};
        const url = s3.getSignedUrl('getObject', params);
        setPageIsLoading(true);
        parseReportCSVAndSendToBackend(url, getAxiosOptions(user.data.authToken), () => setPageIsLoading(false));
    };

    const getReportOptions = useMemo(() => {
        const content = [];
        if(selectedReport.included_industries) {
            content.push(<p key='includedIndustryHeader'>INCLUDED INDUSTRY VERTICALS</p>);
            content.push(<div key='includedIndustryContent'>{JSON.parse(selectedReport.included_industries).map(industry => <div key={industry}><p>{industry}</p></div>)}</div>)
        };
        if(selectedReport.excluded_industries) {
            content.push(<p key='excludedIndustryHeader'>EXCLUDED INDUSTRY VERTICALS</p>);
            content.push(<div key='excludedIndustryContent'>{JSON.parse(selectedReport.excluded_industries).map(industry => <div key={industry}><p>{industry}</p></div>)}</div>)
        };
        if(selectedReport.included_technologies) {
            content.push(<p key='includedTechnologyHeader'>INCLUDED TECHNOLOGIES</p>);
            content.push(<div key='includedTechnologyContent'>{JSON.parse(selectedReport.included_technologies).map(technology => <div key={technology.name}><img src={technology.logo_url} /><p>{technology.name}</p></div>)}</div>)
        };
        if(selectedReport.excluded_technologies) {
            content.push(<p key='excludedTechnologyHeader'>EXCLUDED TECHNOLOGIES</p>);
            content.push(<div key='excludedTechnologyContent'>{JSON.parse(selectedReport.excluded_technologies).map(technology => <div key={technology.name}><img src={technology.logo_url} /><p>{technology.name}</p></div>)}</div>)
        };
        if(selectedReport.included_employees_count) {
            content.push(<p key='includedEmployeesHeader'>INCLUDED EMPLOYEES COUNT</p>);
            content.push(<div key='includedEmployeesContent'>{JSON.parse(selectedReport.included_employees_count).map(employeeCount => <div key={employeeCount}><p>{employeeCount}</p></div>)}</div>)
        };
        if(selectedReport.excluded_employees_count) {
            content.push(<p key='excludedEmployeesHeader'>EXCLUDED EMPLOYEES COUNT</p>);
            content.push(<div key='excludedEmployeesContent'>{JSON.parse(selectedReport.excluded_employees_count).map(employeeCount => <div key={employeeCount}><p>{employeeCount}</p></div>)}</div>)
        };
        if(selectedReport.included_locations) {
            content.push(<p key='includedLocationsHeader'>INCLUDED LOCATIONS</p>);
            content.push(<div key='includedLocationsContent'>{JSON.parse(selectedReport.included_locations).map(location => <div key={location.state || location.country}><p>{location.state ? `${location.state}, ${location.country}` : location.country}</p></div>)}</div>)
        };
        if(selectedReport.excluded_locations) {
            content.push(<p key='excludedLocationsHeader'>EXCLUDED LOCATIONS</p>);
            content.push(<div key='excludedLocationsContent'>{JSON.parse(selectedReport.excluded_locations).map(location => <div key={location.state || location.country}><p>{location.state ? `${location.state}, ${location.country}` : location.country}</p></div>)}</div>)
        };
        return content
    }, [ selectedReport ]);

    const getCorrelatedTechs = useMemo(() => {
        const correlatedTechs = [];
        for(let index = 0; index < reportDataInApi.co_related_technologies.length; index++) {
            if(correlatedTechs[0] === undefined) {
                correlatedTechs.push([<div key={index}><img src={reportDataInApi.co_related_technologies[index].logo_url} /><p>{reportDataInApi.co_related_technologies[index].name}</p></div>]);
            }else if(correlatedTechs.length % 2 === 1) {
                if(correlatedTechs[correlatedTechs.length - 1].length < 3) {
                    correlatedTechs[correlatedTechs.length - 1].push(<div key={index}><img src={reportDataInApi.co_related_technologies[index].logo_url} /><p>{reportDataInApi.co_related_technologies[index].name}</p></div>);
                }else {
                    correlatedTechs.push([<div key={index}><img src={reportDataInApi.co_related_technologies[index].logo_url} /><p>{reportDataInApi.co_related_technologies[index].name}</p></div>]);
                };
            }else {
                if(correlatedTechs[correlatedTechs.length - 1].length < 4) {
                    correlatedTechs[correlatedTechs.length - 1].push(<div key={index}><img src={reportDataInApi.co_related_technologies[index].logo_url} /><p>{reportDataInApi.co_related_technologies[index].name}</p></div>);
                }else {
                    correlatedTechs.push([<div key={index}><img src={reportDataInApi.co_related_technologies[index].logo_url} /><p>{reportDataInApi.co_related_technologies[index].name}</p></div>]);
                };
            };
        };
        return correlatedTechs.map((correlatedTechOnLine, index) => <div key={index}>{correlatedTechOnLine}</div>)
    }, [reportDataInApi.co_related_technologies.length]);

    return(
        <div className='reportContainer'>
            <div>
                <p>Reports</p>
                <Link to={`${reportsPageUrl}/create`}>Build new Report</Link>
            </div>
            <div>
                <div>
                    <img src={selectedReport.technology_logo_url} />
                    <p>{selectedReport.technology_name} Report</p>
                </div>
                <div>
                    {/* {<button disabled={selectedReport.status !== 'generated'} style={selectedReport.status !== 'generated' ? {backgroundColor: '#8495a2'} : null} onClick={handleSendZapierClick}>Send to Zapier</button>} */}
                    {user.data.accountInformation.zapier_info && user.data.accountInformation.zapier_info.reportHooks && <button disabled={selectedReport.status !== 'generated'} style={selectedReport.status !== 'generated' ? {backgroundColor: '#8495a2'} : null} onClick={handleSendZapierClick}>Send to Zapier</button>}
                    <button onClick={getReportDataFromApi}>Refresh</button>
                    <button disabled={selectedReport.status !== 'generated'} style={selectedReport.status !== 'generated' ? {backgroundColor: '#8495a2'} : null} onClick={handleDownloadButtonClick}>{selectedReport.status === 'generated' ? 'Ready for Download' : 'Generating report until it is ready to download'}</button>
                    <button onClick={handleDeleteButton}>Delete</button>
                </div>
            </div>
            <div>
                <div>
                    <p>CREATED</p>
                    <span>{moment(getCurrentTimezoneDate(selectedReport.created_at)).fromNow()}</span>
                    <p>SIZE</p>
                    <span>{selectedReport.included_websites_count} Websites</span>
                    { getReportOptions }
                </div>
            </div>
            <div>
                <div>
                    <p>LEADING INDUSTRY VERTICALS</p>
                    <div>
                        {
                            reportDataInApi.leading_industries.map(industry => (
                                <React.Fragment key={industry.name}>
                                    <p>{industry.name}</p>
                                    <div>
                                        <MobileStepper
                                            position='static'
                                            variant="progress"
                                            steps={11}
                                            activeStep={industry.percentage/10}
                                            classes={classesForMobileStepper}
                                            LinearProgressProps={{classes: classesForLinearProgress}}
                                        />
                                        <span>{industry.percentage}%</span>
                                    </div>
                                </React.Fragment>
                            ))
                        }
                    </div>
                </div>
                <div>
                    <p>TECH BUDGETS</p>
                    <Chart />
                </div>
                <div>
                    <p>CORRELATED TECHS</p>
                    {getCorrelatedTechs}
                </div>
            </div>
            <div style={generatedReportData && {display: 'block'}}>
                {
                    generatedReportData ?
                        <>
                            {
                                generatedReportData.length > 100 && (
                                    <div className='accessToDownload'>
                                        <p>This is a preview of the generated report. You can see all report by <span onClick={handleDownloadButtonClick}>downloading</span> it.</p>
                                    </div>
                                )
                            }
                            <TechUsageTable defaultRowsInPage={100} companies={generatedReportData} />
                        </>
                    :
                        <button disabled style={{backgroundColor: '#8495a2'}} >Generating report until it is ready to view</button>
                }
            </div>
            <LoadingIndicator state={reports.isLoading || pageIsLoading} />
        </div>
    )
}

export default Report