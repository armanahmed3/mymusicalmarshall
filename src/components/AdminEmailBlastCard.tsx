import React, { useState } from 'react';
import { Send, Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import type { User } from '../types';

interface AdminEmailBlastCardProps {
  users: User[];
  onToast: (msg: string) => void;
}

export const AdminEmailBlastCard: React.FC<AdminEmailBlastCardProps> = ({ users, onToast }) => {
  const [subject, setSubject] = useState('🎵 New Music Mixes & Studio Releases Available on Music Marshall!');
  const [headline, setHeadline] = useState('Exclusive Studio Mixes & Rocksteady Masters Just Dropped');
  const [bodyContent, setBodyContent] = useState(
    'Greetings Member,\n\nWe have just updated the Music Marshall Master Vault with brand new continuous music mixes, Rocksteady tribute sessions by Wayne Armond, and live soundclash jugglings.\n\nLog in now to stream or download these exclusive studio tracks.'
  );
  const [targetAudience, setTargetAudience] = useState<'all' | 'approved' | 'loyalty'>('approved');
  const [isSending, setIsSending] = useState(false);
  const [blastResult, setBlastResult] = useState<{ success: boolean; sentCount?: number; total?: number; error?: string } | null>(null);

  const getRecipients = () => {
    if (targetAudience === 'approved') {
      return users.filter((u) => u.accountStatus === 'approved');
    }
    if (targetAudience === 'loyalty') {
      return users.filter((u) => u.isLoyaltyEnrolled);
    }
    return users;
  };

  const recipients = getRecipients();

  const handleSendBlast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !bodyContent.trim()) return;

    if (recipients.length === 0) {
      alert('No recipients match the selected target audience.');
      return;
    }

    if (!confirm(`Are you sure you want to broadcast this email blast to ${recipients.length} members via official SMTP (mymusicmarshall@gmail.com)?`)) {
      return;
    }

    setIsSending(true);
    setBlastResult(null);

    try {
      const res = await fetch('/api/send-email-blast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: subject.trim(),
          headline: headline.trim(),
          content: bodyContent.trim(),
          recipients: recipients.map((u) => ({ email: u.email, username: u.username }))
        })
      });

      const data = await res.json();
      if (data.success) {
        setBlastResult({ success: true, sentCount: data.sentCount, total: data.total });
        onToast(`Email blast dispatched to ${data.sentCount} members successfully!`);
      } else {
        setBlastResult({ success: false, error: data.error || 'Failed to dispatch blast' });
      }
    } catch (err: any) {
      setBlastResult({ success: false, error: err.message || 'Network error sending email blast' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="admin-card" style={{ marginTop: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Mail size={20} color="#00d2ff" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
            Member Email Blast (SMTP Broadcast)
          </h3>
        </div>
        <span style={{ fontSize: '0.74rem', background: 'rgba(0, 210, 255, 0.12)', color: '#00d2ff', border: '1px solid rgba(0, 210, 255, 0.25)', padding: '3px 8px', borderRadius: '9999px', fontWeight: 800 }}>
          SMTP: mymusicmarshall@gmail.com
        </span>
      </div>

      <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '0 0 16px 0', lineHeight: 1.4 }}>
        Broadcast customized announcements, new music mix drop alerts, or updates directly to members' inboxes using the verified Gmail SMTP connection.
      </p>

      {blastResult && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '10px',
            marginBottom: '16px',
            fontSize: '0.84rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: blastResult.success ? '#dcfce7' : '#fee2e2',
            color: blastResult.success ? '#15803d' : '#991b1b',
            border: blastResult.success ? '1px solid #86efac' : '1px solid #fca5a5'
          }}
        >
          {blastResult.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>
            {blastResult.success
              ? `Email blast successfully delivered to ${blastResult.sentCount} out of ${blastResult.total} recipients.`
              : `Email blast failed: ${blastResult.error}`}
          </span>
        </div>
      )}

      <form onSubmit={handleSendBlast} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="form-group">
            <label>Target Audience</label>
            <select
              className="form-control"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value as any)}
            >
              <option value="approved">Approved Active Members ({users.filter((u) => u.accountStatus === 'approved').length})</option>
              <option value="loyalty">Loyalty Program Members ({users.filter((u) => u.isLoyaltyEnrolled).length})</option>
              <option value="all">All Registered Accounts ({users.length})</option>
            </select>
          </div>

          <div className="form-group">
            <label>Email Subject Line</label>
            <input
              type="text"
              required
              className="form-control"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Email Headline Banner</label>
          <input
            type="text"
            required
            className="form-control"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Announcement Body Message</label>
          <textarea
            required
            rows={4}
            className="form-control"
            value={bodyContent}
            onChange={(e) => setBodyContent(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ background: '#2563eb', borderColor: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          disabled={isSending || recipients.length === 0}
        >
          <Send size={15} />
          <span>{isSending ? `Dispatching to ${recipients.length} inboxes...` : `Send Email Blast (${recipients.length} Recipients)`}</span>
        </button>
      </form>
    </div>
  );
};
