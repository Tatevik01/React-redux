import React, { useState, useEffect } from 'react';
import { useRouteMatch, useHistory } from 'react-router-dom';
import AsyncReactSelect from '../../../AsyncReactSelect/AsyncReactSelect.js';
import './ReportOptions.scss';

import { makeStyles } from '@material-ui/core/styles';
import Slider from '@material-ui/core/Slider';

import getValueForEmployeeSlider from '../../../../helpers/getValueForEmployeeSlider';
import getEmployeeSliderSelectedValue from '../../../../helpers/getEmployeeSliderSelectedValue';

import dotsBar from '../../../../assets/images/dotsBar.svg';
import target from '../../../../assets/images/target.svg';
import lock from '../../../../assets/images/lock.png';

const useStylesForWebsitesSlider = makeStyles(theme => ({
    root: {
        width: '90%',
        color: '#3898de',
        marginLeft: '20px',
        '@media(max-width: 1200px)': {
            width: '85%',
        },
    },
    rail: {
        backgroundColor: '#F0F4FD',
        height: '8px',
    },
    track: {
        height: '8px',
    },
    markLabel: {
        fontSize: '0.7rem',
        color: '#FFFFFF',
        backgroundColor: '#AFB2BA',
        borderRadius: '30px',
        padding: '3px 7px',
        textAlign: 'center',
        top: '40px',
        '@media(max-width: 900px)': {
            fontSize: '0.5rem',
        },
    },
    markLabelActive: {
        backgroundColor: '#3898de'
    },
    thumb: {
        width: '42px',
        height: '42px',
        marginTop: '-17px',
        marginLeft: '-20px',
        backgroundColor: '#FFFFFF',
        border: '5px solid #3898DE',
        '@media(max-width: 900px)': {
            width: '35px',
            height: '35px',
            marginTop: '-16px',
            marginLeft: '-16px',
        },
    },
    mark: {
        width: '4px',
        height: '8px',
        position: 'relative',
        '&:before': {
            width: '35px',
            height: '35px',
            content: "' '",
            position: 'absolute',
            top: '-15px',
            left: '-17px',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundImage: `url(${lock})`,
            border: '5px solid #FCC03D',
            borderRadius: '50%',
            boxSizing: 'border-box',
            boxShadow: '0px 0px 0px 3px rgba(252, 192, 61, 0.4)',
            zIndex: 1,
        },
        '&:after': {
            width: '27px',
            height: '25px',
            content: "' '",
            position: 'absolute',
            top: '-14px',
            left: '-17px',
            border: '4px solid #AFB2BA',
            borderRadius: '50%',
        },
        '@media(max-width: 900px)': {
            '&:before': {
                width: '28px',
                height: '29px',
                top: '-11px',
                left: '-14px',
                border: '4px solid #FCC03D',
            },
            '&:after': {
                width: '20px',
                height: '21px',
                top: '-11px',
                left: '-14px',
            },
        },
    },
    markActive: {
        backgroundColor: '#3898de',
    },
}));

const useStylesForEmployeesSlider = makeStyles(theme => ({
    root: {
        width: '80%',
        color: '#3898de',
        marginLeft: '20px',        
    },
    rail: {
        backgroundColor: '#F0F4FD',
        height: '7px',
    },
    track: {
        height: '7px',
    },
    thumb: {
        width: '31px',
        height: '31px',
        marginTop: '-12px',
        backgroundColor: '#FFFFFF',
        border: '3px solid #3898DE',
        zIndex: '1',
    },
    valueLabel: {
        left: 'calc(-50% + 8px)',
        top: '-20px',
        color: '#000000',
        '&> span' : {
            background: 'none',
            '&> span': {
                color: '#000000',
                fontWeight: 'bold',
                opacity: '0.5',
            },
        },
    },
}));

const marks = [
    {value: 1, label: '100'},
    {value: 2, label: '5000'},
    {value: 3, label: '10,000'},
    {value: 4, label: '20,000'},
    {value: 5, label: '30,000'},
    {value: 6, label: '50,000'},
];

const Thumb = (props) => {
    return (
        <span {...props}>
            <i className="fas fa-grip-lines-vertical" />
            {props.children}
        </span>
    )
};

const ReportOptions = ({ user, createReport, includedWebsitesCount, setIncludedWebsitesCount, updateSelectedOptionData, getSearchedIndustries, getSearchedTechnologiesForSelect, getSearchedLocations, buildNewReport, openNotificationSnackbar }) => {
    const classesForWebsitesSlider = useStylesForWebsitesSlider();
    const classesForEmployeesSlider = useStylesForEmployeesSlider();
    const [websitesMarkValue, setWebsitesMarkValue] = useState(1);
    const [firstSliderValue, setFirstSliderValue] = useState(() => getEmployeeSliderSelectedValue(createReport.selectedOptions.includedEmployeesCount));
    const [secondSliderValue, setSecondSliderValue] = useState([0, 0]);
    const history = useHistory();
    const match = useRouteMatch();

    const reportsPageUrl = match.url.slice(0, match.url.lastIndexOf('/'));

    useEffect(() => {
        let limitedMarkIndex;
        marks.forEach((mark, index) => +mark.label.replace(/,/, '') === user.data.accountInformation.exports ? limitedMarkIndex = index : null);
        const sliderMarks = Array.from(document.querySelectorAll('.MuiSlider-mark'));
        const passedMarks = sliderMarks.slice(0, limitedMarkIndex + 1);
        const remainedMarks = sliderMarks.slice(limitedMarkIndex + 1);
        passedMarks.forEach(mark => {
            mark.classList.add('hideLock');
        });
        remainedMarks.forEach(mark => {
            mark.classList.remove('hideLock');
        });
    }, [ includedWebsitesCount ]);

    useEffect(() => {
        if(firstSliderValue[1] === 9) {
            document.querySelectorAll('.MuiSlider-thumb')[2].style.opacity = 0;
        }else {
            document.querySelectorAll('.MuiSlider-thumb')[2].style.opacity = 1;
        };

        if(secondSliderValue[1] === 9) {
            document.querySelectorAll('.MuiSlider-thumb')[4].style.opacity = 0;
        }else {
            document.querySelectorAll('.MuiSlider-thumb')[4].style.opacity = 1;
        };
    });

    const handleWebsitesInputChange = event => {
        if(event.target.value <= user.data.accountInformation.exports) {
            if(event.target.value === '') {
                setIncludedWebsitesCount(0);
                return
            };
            setIncludedWebsitesCount(event.target.value);
        };
    };

    const handleWebsitesSliderValueChange = (event, value) => {
        const selectedMark = marks.find(mark => mark.value === value);
        const selectedMarkValue = +selectedMark.label.replace(/,/, '');
        if(selectedMarkValue <= user.data.accountInformation.exports) {
            setWebsitesMarkValue(value);
            setIncludedWebsitesCount(selectedMarkValue);
        };
    };

    const handleEmployeesFirstSliderValueChange = (event, newValue) => {
        updateSelectedOptionData('includedEmployeesCount', getValueForEmployeeSlider(newValue));
        setFirstSliderValue(newValue);
    };

    const handleEmployeesSecondSliderValueChange = (event, newValue) => {
        updateSelectedOptionData('excludedEmployeesCount', getValueForEmployeeSlider(newValue));
        setSecondSliderValue(newValue);
    };

    const valueLabelFormat = number => {
        if(number === 1) return '1';
        if(number === 2 ) return '10';
        if(number === 3 ) return '50';
        if(number === 4 ) return '200';
        if(number === 5 ) return '500';
        if(number === 6 ) return '1000';
        if(number === 7 ) return '5000';
        if(number === 8 ) return '10000';
        if(number === 9) return <i className="fas fa-infinity" />;
    };

    const handleButtonSubmit = event => {
        if(user.data.accountInformation.used_reports_count >= user.data.accountInformation.reports) {
            openNotificationSnackbar('Upgrade your subscription plan to create more reports');
            history.push('/account/subscriptions');
        }else {
            buildNewReport()
            .then(() => {
                openNotificationSnackbar('You successfully created your report. Generating report until it is ready to download. You will be notified when it will be finished');
                history.push(reportsPageUrl);
            });
        };
    };

    return(
        <div className='reportOptionsContainer'>
            <p>The list will contain websites using this technology, ordered by tech budget, employees size and industry, You can also target specific leads by adjusting the options below.</p>
            <div>
                <img src={dotsBar} />
                <p><span>Report Size</span> - Maximum amount of websites to include in a report, sorted by company size.</p>
            </div>
            <div>
                <p>{includedWebsitesCount} Websites</p>
                <Slider
                    component='div'
                    min={1}
                    max={6}
                    value={websitesMarkValue}
                    step={1}
                    classes={classesForWebsitesSlider}
                    valueLabelDisplay="off"
                    marks={marks}
                    ThumbComponent={Thumb}
                    onChange={(event, value) => handleWebsitesSliderValueChange(event, value)}
                />
                <div>
                    <p>OR</p>
                    <div>
                        <input type='number' value={includedWebsitesCount} onChange={handleWebsitesInputChange} />
                    </div>
                </div>
            </div>
            <div>
                <img src={target} />
                <p><span>Company Filters</span> - Narrow down your report based on company data</p>
            </div>
            <div>
                <div>
                    <p><span>Include only</span> websites in the following industries</p>
                </div>
                <AsyncReactSelect
                    values={createReport.selectedOptions.includedIndustries}
                    placeholder='Select industry verticals...'
                    noOptionsMessage='No Such Industry Vertical'
                    request={getSearchedIndustries}
                    onChange={value => updateSelectedOptionData('includedIndustries', value)}
                />
                <div>
                    <p><span>Exclude</span> websites in the following industries</p>
                </div>
                <AsyncReactSelect
                    values={createReport.selectedOptions.excludedIndustries}
                    placeholder='Select industry verticals...'
                    noOptionsMessage='No Such Industry Vertical'
                    request={getSearchedIndustries}
                    onChange={value => updateSelectedOptionData('excludedIndustries', value)}
                />
                <div>
                    <p><span>Include only</span> websites using following technologies</p>
                </div>
                <AsyncReactSelect
                    values={createReport.selectedOptions.includedTechnologies}
                    placeholder='Select technologies or technology groups...'
                    noOptionsMessage='No Such Technology'
                    request={getSearchedTechnologiesForSelect}
                    onChange={value => updateSelectedOptionData('includedTechnologies', value)}
                />
                <div>
                    <p><span>Exclude</span> websites using following technologies</p>
                </div>
                <AsyncReactSelect
                    values={createReport.selectedOptions.excludedTechnologies}
                    placeholder='Select technologies or technology groups...'
                    noOptionsMessage='No Such Technology'
                    request={getSearchedTechnologiesForSelect}
                    onChange={value => updateSelectedOptionData('excludedTechnologies', value)}
                />
                <div>
                    <p><span>Include only</span> companies with the following employee count</p>
                </div>
                <div className='rangeWithIconContainer'>
                    <Slider
                        component='div'
                        min={1}
                        max={9}
                        value={firstSliderValue}
                        classes={classesForEmployeesSlider}
                        valueLabelDisplay="auto"
                        ThumbComponent={Thumb}
                        step={1}
                        onChange={handleEmployeesFirstSliderValueChange}
                        valueLabelFormat={valueLabelFormat}
                    />
                    {firstSliderValue[1] === 9 && <i className="fas fa-infinity infinityIcon" />}
                </div>
                <div>
                    <p><span>Exclude</span> companies with the following employee count</p>
                </div>
                <div className='rangeWithIconContainer'>
                    <Slider
                        component='div'
                        min={1}
                        max={9}
                        value={secondSliderValue}
                        classes={classesForEmployeesSlider}
                        valueLabelDisplay="auto"
                        ThumbComponent={Thumb}
                        step={1}
                        onChange={handleEmployeesSecondSliderValueChange}
                        valueLabelFormat={valueLabelFormat}
                    />
                    {secondSliderValue[1] === 9 && <i className="fas fa-infinity infinityIcon" />}
                </div>
                <div>
                    <p><span>Include only</span> websites in the following locations</p>
                </div>
                <AsyncReactSelect
                    values={createReport.selectedOptions.includedLocations}
                    placeholder='Select targeted locations...'
                    noOptionsMessage='No Such Location'
                    request={getSearchedLocations}
                    onChange={value => updateSelectedOptionData('includedLocations', value)}
                />
                <div>
                    <p><span>Exclude</span> websites in the following locations</p>
                </div>
                <AsyncReactSelect
                    values={createReport.selectedOptions.excludedLocations}
                    placeholder='Select targeted locations...'
                    noOptionsMessage='No Such Location'
                    request={getSearchedLocations}
                    onChange={value => updateSelectedOptionData('excludedLocations', value)}
                />
                <button onClick={handleButtonSubmit}>Build my Report</button>
            </div>
        </div>
    )
}

export default ReportOptions