import React, { useState } from 'react';
import {
  HelpCircle,
  Mail,
  Phone,
  MessageSquare,
  Send,
  CheckCircle2,
  Clock,
  Shield,
  FileQuestion,
  UserCheck
} from 'lucide-react';
import type { SupportTicket, User } from '../types';

interface SupportViewProps {
  currentUser: User | null;
  tickets: SupportTicket[];
  onSubmitTicket: (ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'status'>) => void;
  onAdminReplyTicket?: (ticketId: string, reply: string, status: 'in_progress' | 'resolved') => void;
  onOpenAuth: () => void;
}

export const SupportView: React.FC<SupportViewProps> = ({
  currentUser,
  tickets,
  onSubmitTicket,
  onAdminReplyTicket,
  onOpenAuth
}) => {
  const isAdmin = currentUser?.role === 'admin';
  const [activeSupportTab, setActiveSupportTab] = useState<'request' | 'my_tickets' | 'admin_desk'>(
    isAdmin ? 'admin_desk' : 'request'
  );

  // New ticket form
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<SupportTicket['category']>('Technical Support');
  const [priority, setPriority] = useState<SupportTicket['priority']>('medium');
  const [message, setMessage] = useState('');
  const [ticketToast, setTicketToast] = useState<string | null>(null);

  // Admin reply inputs state
  const [replyTexts, setReplyTexts] = useState<{ [ticketId: string]: string }>({});

  const userTickets = isAdmin
    ? tickets
    : tickets.filter((t) => (currentUser && (t.userId === currentUser.id || t.email === currentUser.email)) || (guestEmail && t.email.toLowerCase() === guestEmail.toLowerCase()));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = currentUser?.username || guestName.trim();
    const finalEmail = currentUser?.email || guestEmail.trim();

    if (!finalName || !finalEmail) {
      setTicketToast('Please provide your name and email address to submit a ticket.');
      return;
    }
    if (!subject.trim() || !message.trim()) return;

    onSubmitTicket({
      userId: currentUser ? currentUser.id : undefined,
      username: finalName,
      email: finalEmail,
      subject: subject.trim(),
      category,
      priority,
      message: message.trim()
    });

    setSubject('');
    setMessage('');
    if (!currentUser) {
      setGuestName('');
      setGuestEmail('');
    }
    setTicketToast('Your support request has been dispatched to the SoundMarshall technical desk.');
    setTimeout(() => setTicketToast(null), 4000);
    setActiveSupportTab('my_tickets');
  };

  const handleReplySubmit = (ticketId: string, status: 'in_progress' | 'resolved') => {
    const text = replyTexts[ticketId];
    if (!text || !text.trim()) return;
    if (onAdminReplyTicket) {
      onAdminReplyTicket(ticketId, text.trim(), status);
      setReplyTexts((prev) => ({ ...prev, [ticketId]: '' }));
    }
  };

  return (
    <div className="page-container">
      {/* Header Banner */}
      <div className="section-header">
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(0, 245, 155, 0.15)', color: '#00f59b', border: '1px solid rgba(0, 245, 155, 0.3)', padding: '3px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 800, marginBottom: '8px' }}>
            <HelpCircle size={13} />
            <span>24/7 TECHNICAL & ADMINISTRATIVE HELPDESK</span>
          </div>
          <h2 className="section-title">Technical & Admin Support</h2>
          <p className="section-subtitle">
            Direct assistance for playback streaming, account approvals, master stems, VIP access, and administrative queries.
          </p>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '12px', flexWrap: 'wrap' }}>
        <button
          className={`btn btn-sm ${activeSupportTab === 'request' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveSupportTab('request')}
        >
          <MessageSquare size={14} /> Submit Support Request
        </button>
        <button
          className={`btn btn-sm ${activeSupportTab === 'my_tickets' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveSupportTab('my_tickets')}
        >
          <Clock size={14} /> My Requests ({userTickets.length})
        </button>
        {isAdmin && (
          <button
            className={`btn btn-sm ${activeSupportTab === 'admin_desk' ? 'btn-primary' : 'btn-outline'}`}
            style={{ marginLeft: 'auto', background: activeSupportTab === 'admin_desk' ? 'rgba(0, 245, 155, 0.2)' : 'transparent', color: activeSupportTab === 'admin_desk' ? '#00f59b' : '#94a3b8', borderColor: activeSupportTab === 'admin_desk' ? '#00f59b' : 'rgba(255, 255, 255, 0.15)' }}
            onClick={() => setActiveSupportTab('admin_desk')}
          >
            <Shield size={14} /> Admin Ticket Desk ({tickets.length})
          </button>
        )}
      </div>

      {ticketToast && (
        <div style={{ background: 'rgba(0, 245, 155, 0.12)', border: '1px solid rgba(0, 245, 155, 0.3)', color: '#00f59b', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={16} /> {ticketToast}
        </div>
      )}

      {/* Content depending on active tab */}
      {activeSupportTab === 'request' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '28px' }}>
          {/* Support Ticket Submission Form */}
          <div style={{ background: 'rgba(15, 20, 36, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', padding: '24px', backdropFilter: 'blur(16px)' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 16px 0', color: '#ffffff' }}>
              Submit a Support Request
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {!currentUser && (
                <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '12px 14px', marginBottom: '4px' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Guest Inquirer Details</span>
                    <button type="button" className="btn btn-sm btn-outline" style={{ padding: '2px 8px', fontSize: '0.72rem' }} onClick={onOpenAuth}>
                      Have an account? Sign In
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Your Name *</label>
                      <input
                        type="text"
                        required
                        className="form-control"
                        placeholder="e.g. John Doe"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        style={{ fontSize: '0.85rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Your Email *</label>
                      <input
                        type="email"
                        required
                        className="form-control"
                        placeholder="you@example.com"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        style={{ fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>
                </div>
              )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      className="form-control"
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                    >
                      <option value="Technical Support">Technical & Audio Playback</option>
                      <option value="Account & Verification">Account & Verification</option>
                      <option value="Audio Playback">Download & Master Stems</option>
                      <option value="Admin Inquiry">Admin & Studio Inquiry</option>
                      <option value="General">General Question</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Priority</label>
                    <select
                      className="form-control"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                    >
                      <option value="low">Low (General Query)</option>
                      <option value="medium">Medium (Standard)</option>
                      <option value="high">High (Playback Issue)</option>
                      <option value="urgent">Urgent (Account Gated)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Subject</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="Brief description of your issue"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Detailed Message</label>
                  <textarea
                    required
                    rows={5}
                    className="form-control"
                    placeholder="Explain the technical or administrative support you require in detail..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ marginTop: '6px' }}
                >
                  <Send size={15} /> Submit Support Request
                </button>
              </form>
          </div>

          {/* Direct Support Channels Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: 'rgba(15, 20, 36, 0.85)', color: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(16px)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Shield size={20} color="#00d2ff" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Direct Support Channels</h3>
              </div>
              <p style={{ fontSize: '0.84rem', color: '#94a3b8', margin: '0 0 18px 0', lineHeight: 1.5 }}>
                For immediate urgent requests, license inquiries, or administrative escalation, connect directly via our verified studio channels:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.04)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <Mail size={18} color="#00d2ff" />
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                      Official Admin SMTP Desk
                    </div>
                    <a href="mailto:mymusicmarshall@gmail.com" style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none' }}>
                      mymusicmarshall@gmail.com
                    </a>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.04)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <Mail size={18} color="#00f59b" />
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                      Technical Operations Desk
                    </div>
                    <a href="mailto:support@ellivrocorporation.com" style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none' }}>
                      support@ellivrocorporation.com
                    </a>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.04)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <Phone size={18} color="#fbbf24" />
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                      Hotline & WhatsApp Support
                    </div>
                    <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.88rem' }}>
                      +1 (876) 555-MARSHALL
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ background: 'rgba(15, 20, 36, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '18px' }}>
              <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#ffffff', marginBottom: '6px' }}>
                Estimated Response Times
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.6 }}>
                <li><strong style={{ color: '#ffffff' }}>Urgent VIP Issues:</strong> Within 1-2 hours</li>
                <li><strong style={{ color: '#ffffff' }}>Audio Downloads & Stems:</strong> Same business day</li>
                <li><strong style={{ color: '#ffffff' }}>General Questions:</strong> Within 24 hours</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab: My Requests */}
      {activeSupportTab === 'my_tickets' && (
        <div style={{ background: 'rgba(15, 20, 36, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', padding: '24px', backdropFilter: 'blur(16px)' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 16px 0', color: '#ffffff' }}>
            My Support Inquiries ({userTickets.length})
          </h3>

          {userTickets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
              <FileQuestion size={36} color="#475569" style={{ margin: '0 auto 8px' }} />
              <p style={{ margin: 0 }}>You have not submitted any support inquiries yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {userTickets.map((t) => (
                <div key={t.id} style={{ border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '16px', background: 'rgba(255, 255, 255, 0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#ffffff' }}>{t.subject}</span>
                      <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '9999px', background: 'rgba(255, 255, 255, 0.08)', color: '#cbd5e1', fontWeight: 700 }}>
                        {t.category}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '3px 10px',
                        borderRadius: '9999px',
                        background: t.status === 'resolved' ? 'rgba(0, 245, 155, 0.15)' : t.status === 'in_progress' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: t.status === 'resolved' ? '#00f59b' : t.status === 'in_progress' ? '#fbbf24' : '#f87171',
                        border: `1px solid ${t.status === 'resolved' ? 'rgba(0, 245, 155, 0.3)' : t.status === 'in_progress' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                      }}
                    >
                      {t.status === 'resolved' ? '✓ Resolved' : t.status === 'in_progress' ? '⏳ In Progress' : '● Open'}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.84rem', color: '#cbd5e1', margin: '0 0 12px 0', lineHeight: 1.5 }}>
                    {t.message}
                  </p>

                  {t.adminReply && (
                    <div style={{ background: 'rgba(0, 245, 155, 0.06)', borderLeft: '4px solid #00f59b', borderRadius: '4px', padding: '10px 14px', marginTop: '10px' }}>
                      <div style={{ fontSize: '0.74rem', color: '#00f59b', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <UserCheck size={14} /> SoundMarshall Administrator Reply
                      </div>
                      <p style={{ fontSize: '0.82rem', color: '#e2e8f0', margin: '4px 0 0 0' }}>
                        {t.adminReply}
                      </p>
                    </div>
                  )}

                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '10px' }}>
                    Submitted {t.createdAt} {t.resolvedAt ? `• Resolved ${t.resolvedAt}` : ''}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Admin Support Desk (Admin Only) */}
      {activeSupportTab === 'admin_desk' && isAdmin && (
        <div style={{ background: 'rgba(15, 20, 36, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', padding: '24px', backdropFilter: 'blur(16px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                All Member Support Tickets ({tickets.length})
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
                Review incoming listener requests, dispatch replies, and update resolution status.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {tickets.map((t) => (
              <div
                key={t.id}
                style={{
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '18px',
                  background: t.status === 'open' ? 'rgba(245, 158, 11, 0.05)' : 'rgba(255, 255, 255, 0.02)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '8px' }}>
                  <div>
                    <span style={{ fontSize: '0.98rem', fontWeight: 800, color: '#ffffff' }}>{t.subject}</span>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                      From: <strong style={{ color: '#e2e8f0' }}>{t.username}</strong> ({t.email}) • Category: {t.category} • Priority: <span style={{ textTransform: 'uppercase', fontWeight: 700, color: t.priority === 'urgent' ? '#f87171' : '#fbbf24' }}>{t.priority}</span>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      background: t.status === 'resolved' ? 'rgba(0, 245, 155, 0.15)' : t.status === 'in_progress' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: t.status === 'resolved' ? '#00f59b' : t.status === 'in_progress' ? '#fbbf24' : '#f87171',
                      border: `1px solid ${t.status === 'resolved' ? 'rgba(0, 245, 155, 0.3)' : t.status === 'in_progress' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                    }}
                  >
                    {t.status}
                  </span>
                </div>

                <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', color: '#cbd5e1', margin: '8px 0 14px 0' }}>
                  {t.message}
                </div>

                {t.adminReply && (
                  <div style={{ background: 'rgba(0, 245, 155, 0.06)', border: '1px solid rgba(0, 245, 155, 0.2)', borderRadius: '8px', padding: '10px 14px', marginBottom: '12px' }}>
                    <div style={{ fontSize: '0.72rem', color: '#00f59b', fontWeight: 800 }}>Previous Admin Reply:</div>
                    <div style={{ fontSize: '0.82rem', color: '#e2e8f0', marginTop: '2px' }}>{t.adminReply}</div>
                  </div>
                )}

                {/* Reply Form */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Type administrative reply..."
                    value={replyTexts[t.id] || ''}
                    onChange={(e) => setReplyTexts({ ...replyTexts, [t.id]: e.target.value })}
                    style={{ fontSize: '0.82rem' }}
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-outline"
                    style={{ whiteSpace: 'nowrap' }}
                    onClick={() => handleReplySubmit(t.id, 'in_progress')}
                  >
                    Reply (In Progress)
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    style={{ whiteSpace: 'nowrap' }}
                    onClick={() => handleReplySubmit(t.id, 'resolved')}
                  >
                    ✓ Reply & Resolve
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
