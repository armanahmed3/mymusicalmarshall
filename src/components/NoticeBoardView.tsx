import React from 'react';
import {
  Calendar,
  MapPin,
  ExternalLink,
  Shield,
  Upload,
  Radio,
  Info,
  Trash2
} from 'lucide-react';
import type { EventFlyer, User } from '../types';

interface NoticeBoardViewProps {
  flyers: EventFlyer[];
  currentUser: User | null;
  onOpenAdminFlyerUpload?: () => void;
  onDeleteFlyer?: (id: string) => void;
}

export const NoticeBoardView: React.FC<NoticeBoardViewProps> = ({
  flyers,
  currentUser,
  onOpenAdminFlyerUpload,
  onDeleteFlyer
}) => {
  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="page-container">
      {/* Header Banner */}
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#dbeafe', color: '#1d4ed8', padding: '3px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 800, marginBottom: '8px' }}>
            <Radio size={13} />
            <span>OFFICIAL SOUNDMARSHALL BULLETIN</span>
          </div>
          <h2 className="section-title">Notice Board & Event Flyers</h2>
          <p className="section-subtitle">
            Upcoming soundclashes, live studio master sessions, dub yard sessions, and official announcements.
          </p>
        </div>

        {/* ONLY ADMIN CAN UPLOAD NOTICES - Regular users do NOT have upload notice feature */}
        {isAdmin && onOpenAdminFlyerUpload && (
          <button
            className="btn btn-primary"
            style={{ background: '#0f172a', borderColor: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}
            onClick={onOpenAdminFlyerUpload}
          >
            <Upload size={16} />
            <span>+ Post Event Flyer (Admin)</span>
          </button>
        )}
      </div>

      {/* Notice Board Notice Note for members */}
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px', margin: '16px 0 24px 0' }}>
        <Info size={20} color="#3b82f6" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.4 }}>
          <strong>Notice Board Guidelines:</strong> Official event flyers and studio notices are posted directly by Music Marshall Studio Administrators. Check back regularly for verified event schedules and sound system appearances.
        </div>
      </div>

      {/* Flyers Grid */}
      {flyers.length === 0 ? (
        <div style={{ background: '#ffffff', border: '1px dashed #cbd5e1', borderRadius: '16px', padding: '48px 20px', textAlign: 'center' }}>
          <Calendar size={40} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
            No Event Flyers Currently Active
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>
            Stay tuned! Upcoming sound system dates and album releases will appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
          {flyers.map((flyer) => (
            <div
              key={flyer.id}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s ease'
              }}
            >
              {/* Flyer Artwork */}
              <div style={{ position: 'relative', width: '100%', height: '220px', overflow: 'hidden', background: '#0b0f19' }}>
                <img
                  src={flyer.flyerUrl || '/mm_banner.png'}
                  alt={flyer.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    background: 'rgba(15, 23, 42, 0.85)',
                    backdropFilter: 'blur(6px)',
                    color: '#fff',
                    padding: '4px 10px',
                    borderRadius: '9999px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <Shield size={12} color="#22c55e" /> Verified Official Event
                </div>

                {isAdmin && onDeleteFlyer && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Delete event flyer "${flyer.title}"?`)) {
                        onDeleteFlyer(flyer.id);
                      }
                    }}
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: 'rgba(220, 38, 38, 0.9)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                    title="Delete event flyer (Admin only)"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              {/* Flyer Content */}
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 10px 0', lineHeight: 1.3 }}>
                    {flyer.title}
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px', fontSize: '0.82rem', color: '#475569' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={15} color="#16a34a" />
                      <strong>{flyer.eventDate}</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin size={15} color="#ea580c" />
                      <span>{flyer.location}</span>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                    {flyer.description}
                  </p>
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                    Posted by {flyer.postedBy} • {flyer.createdAt}
                  </span>

                  {flyer.externalLink ? (
                    <a
                      href={flyer.externalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.76rem' }}
                    >
                      <span>Event Info</span>
                      <ExternalLink size={12} />
                    </a>
                  ) : (
                    <span style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: 700 }}>
                      ✓ Studio Confirmed
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
