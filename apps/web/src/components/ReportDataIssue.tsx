import React, { useState } from 'react';

interface ReportDataIssueProps {
  planId: number;
  planName: string;
  onSuccess?: () => void;
}

export function ReportDataIssue({ planId, planName, onSuccess }: ReportDataIssueProps) {
  const [showModal, setShowModal] = useState(false);
  const [issueType, setIssueType] = useState('wrong_price');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan_id: planId,
          issue_type: issueType,
          description,
          user_email: email || undefined
        })
      });

      if (response.ok) {
        setSubmitted(true);
        setTimeout(() => {
          setShowModal(false);
          setSubmitted(false);
          setDescription('');
          setEmail('');
          setIssueType('wrong_price');
          onSuccess?.();
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to report issue:', err);
      alert('Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!showModal) {
    return (
      <button
        onClick={() => setShowModal(true)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          fontSize: '0.85em',
          color: '#6b7280',
          backgroundColor: '#f3f4f6',
          border: '1px solid #e5e7eb',
          borderRadius: '6px',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#e5e7eb';
          (e.currentTarget as HTMLButtonElement).style.color = '#374151';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#f3f4f6';
          (e.currentTarget as HTMLButtonElement).style.color = '#6b7280';
        }}
      >
        <span>⚠️</span>
        Report Incorrect Data
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
      onClick={() => setShowModal(false)}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '500px',
          width: '90%',
          boxShadow: '0 20px 25px rgba(0, 0, 0, 0.15)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2em' }}>Report an Issue</h3>
        <p style={{ color: '#666', marginBottom: '16px', fontSize: '0.95em' }}>
          Plan: <strong>{planName}</strong>
        </p>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#10b981' }}>
            <p style={{ fontSize: '1.5em', margin: '0 0 10px 0' }}>✓</p>
            <p>Thank you for your feedback!</p>
            <p style={{ fontSize: '0.9em', color: '#666', marginTop: '10px' }}>
              Our team will review and take action within 24 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                What's the issue?
              </label>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  fontSize: '0.95em'
                }}
              >
                <option value="wrong_price">Wrong price</option>
                <option value="wrong_speed">Wrong speed</option>
                <option value="wrong_provider">Wrong provider info</option>
                <option value="missing_info">Missing information</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                Details (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Current price is $89/month, not $79/month"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  fontSize: '0.95em',
                  fontFamily: 'inherit',
                  minHeight: '80px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                Your email (optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="so we can follow up"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  fontSize: '0.95em'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.95em',
                  fontWeight: '500',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.6 : 1
                }}
              >
                {submitting ? 'Submitting...' : 'Submit Report'}
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.95em',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
