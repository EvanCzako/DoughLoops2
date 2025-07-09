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
			className={styles.dropdownWrapper}
			style={{
				top: `${top}px`,
				right: '0px',
				position: 'absolute', // required to enable top/left positioning
			}}
		>
			{children}
		</div>,
		document.body
	);

}
