import React, { useEffect } from 'react';
import { Link, Route, useRouteMatch, Switch } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import './Reports.scss';

import CreateReport from './CreateReport/CreateReport';
import ReportItem from './ReportItem/ReportItem';
import Report from './Report/Report';

import useScrollToTopHook from '../../customHooks/useScrollToTopHook';

import PagePreview from '../PagePreview/PagePreview';

import LoadingIndicator from '../LoadingIndicator/LoadingIndicator';

import { getReports } from '../../redux/actions/reportsActions';

import shouldUserCheckSubscription from '../../helpers/shouldUserCheckSubscription';
import getPrebuildReportData from '../../helpers/getPrebuildReportData';

import docs from '../../assets/images/docs.svg';

const Reports = () => {
    const scrollToTopHook = useScrollToTopHook();
    const match = useRouteMatch();
    const dispatch = useDispatch();
    const user = useSelector(store => store.user);
    const reports = useSelector(store => store.reports);

    useEffect(() => {
        if(user.isLoggedIn) {
            dispatch(getReports());
        };
    }, [ user.isLoggedIn && user.data.accountInformation.used_reports_count ]);
    
    if(!user.isLoggedIn || shouldUserCheckSubscription(user)) return <PagePreview type='reports' userIsLoggedIn={user.isLoggedIn} />;

    return(
        <Switch>
            <Route exact path={match.path}>
                <div className='reportsContainer'>
                    <div>
                        <p>Reports</p>
                        <Link to={`${match.url}/create`}>Build new Report</Link>
                    </div>
                    {
                        reports.allReports.length ?
                            <div className='haveReportsContainer'>
                                {
                                    reports.allReports.map((groupedReport, index) => <ReportItem key={index} user={user} groupedReport={groupedReport} />)
                                }
                            </div>
                        :
                            <div className='noReportsContainer'>
                                <img src={docs} />
                                <p>Create your first report to get started</p>
                                <div>
                                    <p>To get started, you can customize your own report from scratch or try out one these examples:</p>
                                    <Link to={{pathname: `${match.url}/create`, state: getPrebuildReportData('Shopify')}}>- All active e-commerce sites in United States who run on Shopify</Link>
                                    <Link to={{pathname: `${match.url}/create`, state: getPrebuildReportData('Salesforce')}}>- All the biggest customers of Salesforce</Link>
                                    <Link to={{pathname: `${match.url}/create`, state: getPrebuildReportData('Hubspot')}}>- Companies using Hubspot in Europe</Link>
                                    <Link to={{pathname: `${match.url}/create`, state: getPrebuildReportData('Marketo')}}>- The biggest customers of Marketo</Link>
                                </div>
                            </div>
                    }
                    <LoadingIndicator state={reports.isLoading} />
                </div>
            </Route>
            <Route exact path={`${match.path}/create`} component={CreateReport} />
            <Route exact path={`${match.path}/:id`} component={Report} />
        </Switch>
    )
}

export default Reports