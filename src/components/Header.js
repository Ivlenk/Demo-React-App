
import React from 'react';
import '../styles.css';

export default function Header() {
	return (
		<div className="header">
			<img className="logo" src="images/kanbanboard.png" alt="Kanban" />
			<h2 className="app-subtitle">Let's get some work done!</h2>
		</div>
	);
}
