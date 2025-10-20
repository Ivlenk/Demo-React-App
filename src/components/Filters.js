import React from 'react';
import '../styles.css';

export default function Filters({handleSearchChange, handleCardTypeFilterChange}){
    // todo: make select data driven
    return(
        <div className="filters">
            <div className="filter-label">Search</div>
            <div className="filter-param"><input className="filter-input" type="text" onChange={handleSearchChange}/></div>
            <div className="filter-dropdown">
            <div className="filter-type-label">Select Type</div>                
                <select className="type-dropdown" defaultValue={"all"} onChange={handleCardTypeFilterChange}>
                    <option value="all">ALL</option>
                    <option value="design">Design</option>
                    <option value="ui">UI</option>
                    <option value="ux">UX</option>
                    <option value="server">Server</option>
                    <option value="bug">Bug</option>
                    <option value="mocks">Mocks</option>
                    <option value="docs">Docs</option>
                    <option value="db">Database</option>
                    <option value="tests">Tests</option>
                </select>
            </div>
        </div>
    );
}