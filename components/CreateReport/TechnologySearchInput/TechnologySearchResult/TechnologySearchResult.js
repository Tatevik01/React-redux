import React, { useEffect, useRef } from 'react';
import './TechnologySearchResult.scss';

import LoadingIndicator from '../../../../LoadingIndicator/LoadingIndicator';

const TechnologySearchResult = ({ isLoading, createReport, setShowResults, selectTechnology, setInputValue }) => {
    const searchResultRef = useRef();

    useEffect(() => {
        const clickCallback = event => {
            if(!searchResultRef.current.contains(event.target)) {
                if(event.target.parentElement !== searchResultRef.current.parentElement) setShowResults(false);
            };
        };
        document.addEventListener('click', clickCallback);

        return () => document.removeEventListener('click', clickCallback);
    });

    const handleTechnologyClick = (event, technology) => {
        selectTechnology(technology)
        .then(selectedTechnology => {
            setInputValue(selectedTechnology.name);
            setShowResults(false);
        });
    };

    return(
        <div className='technologySearchResultContainer' style={isLoading ? {height: '100px', padding: 0} : null} ref={searchResultRef}>
            {
                isLoading ? <LoadingIndicator state={isLoading} style={{paddingLeft: 0}} />
                :
                <>
                    {createReport.searchValue === '' && <span>Type to search</span>}
                    {createReport.searchValue !== '' && createReport.technologies.length === 0 && <span>Results Not Found</span>}
                    {
                        createReport.technologies.length > 0 && (<>
                            {
                                createReport.technologies.map(technology => <p key={technology.id} onClick={event => handleTechnologyClick(event, technology)}><img src={technology.logo_url} />{technology.name}</p>)
                            }
                        </>)
                    }
                </>
            }
        </div>
    )
}

export default TechnologySearchResult