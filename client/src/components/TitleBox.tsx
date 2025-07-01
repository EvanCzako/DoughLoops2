import React from 'react';
import { useStore } from '../store';
import styles from '../styles/TitleBox.module.css';

export default function TitleBox() {
    return (
        <div className={styles.titleBox}>
            <h1>DoughLoops</h1>
        </div>
    );
}
