import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useStore } from '../store';

import styles from '../styles/AuthPage.module.css';

interface Props {
	anchorRef: React.RefObject<HTMLElement | null>;
	children: React.ReactNode;
}

export default function DropdownWrapper({ anchorRef, children }: Props) {
	const panelRef = useRef<HTMLDivElement>(null);
	const setDropdownOpen = useStore((s) => s.setUserDropdownOpen);

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (
				panelRef.current &&
				!panelRef.current.contains(e.target as Node) &&
				!anchorRef.current?.contains(e.target as Node)
			) {
				setDropdownOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [setDropdownOpen, anchorRef]);

	const anchorRect = anchorRef.current?.getBoundingClientRect();
	const top = (anchorRect?.bottom ?? 0) + window.scrollY;
	const left = (anchorRect?.left ?? 0) + window.scrollX;

return createPortal(
	<div
		ref={panelRef}
		style={{
			position: 'absolute',
			top: `${top}px`,
			// left: `${left}px`,
			right: '0px',
			zIndex: 999,
			background: '#111',
			color: 'white',
			border: '1px solid #333',
			borderRadius: '8px',
			padding: '16px',
			boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
			minWidth: '280px',
			maxWidth: '90vw',
		}}
	>
		{children}
	</div>,
	document.body
);


}
