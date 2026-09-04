import { useEffect, useRef, RefObject, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useStore } from '../store';
import styles from '../styles/DropdownWrapper.module.css';

interface Props {
    anchorRef: RefObject<HTMLElement | null>;
    children: ReactNode;
    compact?: boolean;
    onClose?: () => void;
}

export default function DropdownWrapper({ anchorRef, children, compact = false, onClose }: Props) {
    const panelRef = useRef<HTMLDivElement>(null);
    const setUserDropdownOpen = useStore((s) => s.setUserDropdownOpen);

    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;

    useEffect(() => {
        const close = () => {
            if (onCloseRef.current) onCloseRef.current();
            else setUserDropdownOpen(false);
        };

        const handleClickOutside = (e: MouseEvent) => {
            if (
                panelRef.current &&
                !panelRef.current.contains(e.target as Node) &&
                !anchorRef.current?.contains(e.target as Node)
            ) {
                close();
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') close();
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [anchorRef, setUserDropdownOpen]);

    const top = anchorRef.current?.getBoundingClientRect().bottom ?? 0;

    return createPortal(
        <div
            ref={panelRef}
            className={`${styles.dropdownPanel} ${compact ? '' : styles.wide}`}
            style={{ top: `${top}px`, maxHeight: `calc(100dvh - ${top}px - 12px)` }}
        >
            {children}
        </div>,
        document.body
    );
}
