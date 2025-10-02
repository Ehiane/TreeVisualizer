import { useEffect, useRef } from 'react';
import styles from '../styles/app.module.css';
import { useTreeStore } from '../state/useTreeStore';

export function StepLog() {
  const { steps, index, goto, pause, playing } = useTreeStore();
  const listRef = useRef<HTMLUListElement>(null);
  const activeItemRef = useRef<HTMLLIElement>(null);

  const handleStepClick = (stepIndex: number) => {
    if (playing) {
      pause();
    }
    goto(stepIndex);
  };

  // Auto-scroll to active step
  useEffect(() => {
    if (activeItemRef.current && listRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [index]);

  if (steps.length === 0) {
    return (
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Step Log</h3>
        <p style={{ color: 'var(--gray-11)', fontSize: '14px', padding: '16px', textAlign: 'center' }}>
          Select a traversal to see steps here
        </p>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>Step Log</h3>

      <ul className={styles.stepList} ref={listRef}>
        {steps.map((step, i) => {
          const isActive = i === index;
          const isPast = i < index;

          return (
            <li
              key={i}
              ref={isActive ? activeItemRef : null}
              className={styles.block}
              style={{
                opacity: isPast ? 0.5 : 1,
                backgroundColor: isActive ? 'var(--accent-3)' : undefined,
                borderLeftWidth: '3px',
                borderLeftColor: isActive ? 'var(--accent-9)' : 'transparent',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
              }}
              onClick={() => handleStepClick(i)}
            >
              <div className={styles.blockContent}>
                <h4 className={styles.blockTitle}>Step {i + 1}</h4>
                <p className={styles.blockDescription}>{step.message}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
