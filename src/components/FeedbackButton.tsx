import { MessageSquare, X } from 'lucide-react';
import { useState, useEffect, FormEvent } from 'react';
import styles from '../styles/app.module.css';

export function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    try {
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(form) as any).toString(),
      });

      if (response.ok) {
        setSubmitted(true);
        setTimeout(() => {
          setIsOpen(false);
          setSubmitted(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          border: 'none',
          background: 'var(--accent-9)',
          color: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15), 0 0 20px rgba(var(--accent-9-rgb, 59, 130, 246), 0.5)',
          transition: 'all 0.3s ease',
          zIndex: 1000,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2), 0 0 30px rgba(var(--accent-9-rgb, 59, 130, 246), 0.7)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15), 0 0 20px rgba(var(--accent-9-rgb, 59, 130, 246), 0.5)';
        }}
        aria-label="Send feedback"
      >
        <MessageSquare size={24} />
      </button>

      {isOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsOpen(false)}>
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '500px' }}
          >
            <div className={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <MessageSquare size={20} style={{ color: 'var(--accent-9)' }} />
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>Send Feedback</h3>
                <button
                  className={styles.btnIcon}
                  onClick={() => setIsOpen(false)}
                  aria-label="Close feedback form"
                  style={{ marginLeft: 'auto' }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className={styles.modalBody}>
              {submitted ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <p style={{ margin: 0, fontSize: '14px', color: 'var(--fg)' }}>
                    Thank you for your feedback!
                  </p>
                </div>
              ) : (
                <form
                  name="feedback"
                  method="POST"
                  data-netlify="true"
                  onSubmit={handleSubmit}
                >
                  <input type="hidden" name="form-name" value="feedback" />

                  <div style={{ marginBottom: '16px' }}>
                    <label
                      htmlFor="name"
                      style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}
                    >
                      Name (optional)
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        fontSize: '14px',
                        border: '1px solid var(--gray-6)',
                        borderRadius: '6px',
                        background: 'var(--bg-alt)',
                        color: 'var(--fg)',
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label
                      htmlFor="email"
                      style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}
                    >
                      Email (optional)
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        fontSize: '14px',
                        border: '1px solid var(--gray-6)',
                        borderRadius: '6px',
                        background: 'var(--bg-alt)',
                        color: 'var(--fg)',
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label
                      htmlFor="feedback"
                      style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}
                    >
                      Your Feedback *
                    </label>
                    <textarea
                      id="feedback"
                      name="feedback"
                      required
                      rows={5}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        fontSize: '14px',
                        border: '1px solid var(--gray-6)',
                        borderRadius: '6px',
                        background: 'var(--bg-alt)',
                        color: 'var(--fg)',
                        resize: 'vertical',
                        fontFamily: 'inherit',
                      }}
                      placeholder="Tell us what you think about TreeInspect..."
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button
                      type="button"
                      className={styles.btn}
                      onClick={() => setIsOpen(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
                      Send Feedback
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
