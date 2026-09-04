import { useStore } from '../store';
import NewDoughLoopForm from './NewDoughLoopForm';
import DoughLoopList from './DoughLoopList';
import styles from '../styles/UserLoopsWrapper.module.css';

/*
 * Part of the account feature, which is currently not mounted anywhere --
 * see the note at the top of App.tsx. Pair it with <AuthPage />, which covers
 * the signed-out case.
 */
export default function UserLoopsWrapper() {
    const user = useStore((s) => s.user);

    if (!user) return null;

    return (
        <div className={styles.userLoopsWrapper}>
            <NewDoughLoopForm />
            <DoughLoopList />
        </div>
    );
}
