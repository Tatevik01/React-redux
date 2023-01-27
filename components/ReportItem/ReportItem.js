import React from 'react';
import { Link, useRouteMatch } from 'react-router-dom';
import moment from 'moment';

import { makeStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import getCurrentTimezoneDate from '../../../helpers/getCurrentTimezoneDate';

const useStylesExpansionPanel = makeStyles(theme => ({
    root: {
        marginBottom: '20px',
    },
}));

const useStylesExpansionPanelSummary = makeStyles(theme => ({
    root: {
        display: 'flex',
        flexDirection: 'row-reverse',
        padding: '0',
        backgroundColor: '#F0F4FD',
        alignItems: 'center',        
    },
    content: {
        display: 'flex',
        alignItems: 'center',
        '& > img': {
            width: '37px',
            margin: '0 9px 0 20px',
            '@media(max-width: 600px)': {
                width: '25px',
                margin: '0 9px 0 12px',
            },
        },
        '& > p': {
            fontWeight: '500',
            fontSize: '1rem',
            color: '#000000',
            margin: '0',
            '& > span': {
                fontSize: '0.8rem',
                color: '#3898DE',
                marginLeft: '27px',
                '@media(max-width: 600px)': {
                    marginLeft: '20px',
                },
            },
        },
    },
}));

const useStylesExpansionPanelDetails = makeStyles(theme => ({
    root: {
        padding: '10px 50px 25px 50px',
        justifyContent: 'space-between',
        borderBottom: '0.5px solid #b1bbc4',
        '&:last-child': {
            borderBottom: 'none',
        },
        '& > div': {
            width: '60%',
            display: 'flex',
            justifyContent: 'space-between',
            '& > p': {
                margin: 0,
                fontSize: '0.7rem',
                color: '#232A30',
                opacity: '0.5',
            },
            '& > div:nth-of-type(1)': {
                '& > p:nth-of-type(1)': {
                    margin: 0,
                    fontWeight: 'bold',
                    fontSize: '0.7rem',
                    color: '#232A30',
                    opacity: '0.5',
                    marginBottom: '5px',
                },
                '& > p:nth-of-type(2)': {
                    margin: 0,
                    fontSize: '0.7rem',
                    color: '#232A30',
                    opacity: '0.5',
                    marginBottom: '5px',
                },
                '& > a:nth-of-type(1)': {
                    fontWeight: '500',
                    fontSize: '0.6rem',
                    color: '#006DBD',
                    opacity: '0.5',
                    '&:visited': {
                        color: '#006DBD',
                    },
                },
            },
            '& > div:nth-of-type(2)': {
                'maxWidth': '160px',
                '& > p:nth-of-type(odd)': {
                    margin: 0,
                    fontWeight: '500',
                    fontSize: '0.6rem',
                    color: '#000000',
                    backgroundColor: '#F0F4FD',
                    padding: '2px 0 2px 9px',
                    borderRadius: '10px',
                    marginBottom: '5px',
                },
                '& > p:nth-of-type(even)': {
                    fontWeight: '500',
                    fontSize: '0.6rem',
                    color: '#42C960',
                    margin: '0 0 5px 9px',
                    '& > span': {
                        color: '#CB1A1A',
                    },
                },
            },
            '@media(max-width: 500px)': {
                width: '100%',
            },
        },
        '& > a': {
            backgroundColor: '#42C960',
            borderRadius: '6px',
            padding: '13px 33px',
            textDecoration: 'none',
            height: 'fit-content',
            fontWeight: 'bold',
            fontSize: '1rem',
            color: '#FFFFFF',
            transitionDuration: '0.4s',
            '&:visited': {
                color: '#FFFFFF',
            },
            '&:hover': {
                backgroundColor: '#45a95b',
            },
            '@media(max-width: 600px)': {
                padding: '10px 20px',
            },
        },
        '@media(max-width: 900px)': {
            padding: '10px 15px 25px 15px',
        },
        '@media(max-width: 500px)': {
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
        },
    },
}));

const ReportItem = ({ user, groupedReport }) => {
    const match = useRouteMatch();
    const classesExpansionPanel = useStylesExpansionPanel();
    const classesExpansionPanelSummary = useStylesExpansionPanelSummary();
    const classesExpansionPanelDetails = useStylesExpansionPanelDetails();

    const getReportOptions = report => {
        const content = [];
        if(report.included_industries) {
            content.push(<p key='industryHeader'>Industry Verticals</p>);
            if(report.excluded_industries) {
                content.push(<p key='industryContent'>{JSON.parse(report.included_industries).join(', ')}, <span>{JSON.parse(report.excluded_industries).join(', ')}</span></p>);
            }else {
                content.push(<p key='industryContent'>{JSON.parse(report.included_industries).join(', ')}</p>);
            }
        }else if(report.excluded_industries) {
            content.push(<p key='industryHeader'>Industry Verticals</p>);
            content.push(<p key='industryContent'><span>{JSON.parse(report.excluded_industries).join(', ')}</span></p>);
        };
        if(report.included_technologies) {
            content.push(<p key='technologyHeader'>Technologies</p>);
            if(report.excluded_technologies) {
                const includedTechnologies = JSON.parse(report.included_technologies).map(technology => technology.name).join(', ');
                const excludedTechnologies = JSON.parse(report.excluded_technologies).map(technology => technology.name).join(', ');
                content.push(<p key='technologyContent'>{includedTechnologies}, <span>{excludedTechnologies}</span></p>);
            }else {
                const includedTechnologies = JSON.parse(report.included_technologies).map(technology => technology.name).join(', ');
                content.push(<p key='technologyContent'>{includedTechnologies}</p>);
            }
        }else if(report.excluded_technologies) {
            content.push(<p key='technologyHeader'>Technologies</p>);
            const excludedTechnologies = JSON.parse(report.excluded_technologies).map(technology => technology.name).join(', ');
            content.push(<p key='technologyContent'><span>{excludedTechnologies}</span></p>);
        };
        if(report.included_employees_count) {
            content.push(<p key='employeesHeader'>Employees Count</p>);
            if(report.excluded_employees_count) {
                content.push(<p key='employeesContent'>{JSON.parse(report.included_employees_count).join(', ')}, <span>{JSON.parse(report.excluded_employees_count).join(', ')}</span></p>);
            }else {
                content.push(<p key='employeesContent'>{JSON.parse(report.included_employees_count).join(', ')}</p>);
            }
        }else if(report.excluded_employees_count) {
            content.push(<p key='employeesHeader'>Employees Count</p>);
            content.push(<p key='employeesContent'><span>{JSON.parse(report.excluded_employees_count).join(', ')}</span></p>);
        };
        if(report.included_locations) {
            content.push(<p key='locationsHeader'>Locations</p>);
            if(report.excluded_locations) {
                const includedLocations = JSON.parse(report.included_locations).map(location => location.state ? `${location.state}-${location.country}` : location.country).join(', ');
                const excludedLocations = JSON.parse(report.excluded_locations).map(location => location.state ? `${location.state}-${location.country}` : location.country).join(', ');
                content.push(<p key='locationsContent'>{includedLocations}, <span>{excludedLocations}</span></p>);
            }else {
                const includedLocations = JSON.parse(report.included_locations).map(location => location.state ? `${location.state}-${location.country}` : location.country).join(', ');
                content.push(<p key='locationsContent'>{includedLocations}</p>);
            }
        }else if(report.excluded_locations) {
            content.push(<p key='locationsHeader'>Locations</p>);
            const excludedLocations = JSON.parse(report.excluded_locations).map(location => location.state ? `${location.state}-${location.country}` : location.country).join(', ');
            content.push(<p key='locationsContent'><span>{excludedLocations}</span></p>);
        };

        return content
    };

    return(
        <ExpansionPanel classes={classesExpansionPanel}>
            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />} classes={classesExpansionPanelSummary}>
                <img src={groupedReport[0].technology_logo_url} />
                <p>{groupedReport[0].technology_name}<span>{groupedReport.length} {groupedReport.length === 1 ? 'report' : 'reports'}</span></p>
            </ExpansionPanelSummary>
            {
                groupedReport.map(report => (
                    <ExpansionPanelDetails key={report.id} classes={classesExpansionPanelDetails}>
                        <div>
                            <p>{moment(getCurrentTimezoneDate(report.created_at)).fromNow()}</p>
                            <div>
                                <p>{report.technology_name}</p>
                                <p>{report.included_websites_count} websites</p>
                                <Link to={user.data.accountInformation.plan_name ? `${match.url}/${report.id}` : '/account/subscriptions'}>More results are available</Link>
                            </div>
                            <div>{ getReportOptions(report) }</div>
                        </div>
                        <Link to={`${match.url}/${report.id}`}>View my Report</Link>
                    </ExpansionPanelDetails>
                ))
            }
        </ExpansionPanel>
    )
}

export default ReportItem