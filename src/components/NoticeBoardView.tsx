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
            <span>OFFICIAL MUSIC MARSHALL BULLETIN</span>
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
      <div style={{ background: 'rgba(0, 210, 255, 0.06)', border: '1px solid rgba(0, 210, 255, 0.25)', borderRadius: '14px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px', margin: '16px 0 24px 0' }}>
        <Info size={20} color="#00d2ff" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: '0.84rem', color: '#cbd5e1', lineHeight: 1.4 }}>
          <strong style={{ color: '#00d2ff' }}>Notice Board Guidelines:</strong> Official event flyers and studio notices are posted directly by Music Marshall Studio Administrators. Check back regularly for verified event schedules and sound system appearances.
        </div>
      </div>

      {/* Flyers Grid */}
      {flyers.length === 0 ? (
        <div style={{ background: 'rgba(15, 20, 36, 0.75)', border: '1px dashed rgba(255, 255, 255, 0.15)', borderRadius: '16px', padding: '48px 20px', textAlign: 'center' }}>
          <Calendar size={40} color="#00f59b" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: '0 0 6px 0' }}>
            No Event Flyers Currently Active
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
            Stay tuned! Upcoming sound system dates and album releases will appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
          {flyers.map((flyer) => (
            <div
              key={flyer.id}
              style={{
                background: 'rgba(15, 20, 36, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 12px 30px rgba(0,0,0,0.4)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s ease, border-color 0.2s ease',
                backdropFilter: 'blur(16px)'
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
                    background: 'rgba(11, 15, 26, 0.9)',
                    backdropFilter: 'blur(8px)',
                    color: '#fff',
                    padding: '4px 10px',
                    borderRadius: '9999px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    border: '1px solid rgba(0, 245, 155, 0.3)'
                  }}
                >
                  <Shield size={12} color="#00f59b" /> Verified Official Event
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
                      background: 'rgba(239, 68, 68, 0.9)',
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
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: '0 0 10px 0', lineHeight: 1.3 }}>
                    {flyer.title}
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px', fontSize: '0.82rem', color: '#cbd5e1' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={15} color="#00f59b" />
                      <strong style={{ color: '#ffffff' }}>{flyer.eventDate}</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin size={15} color="#fb923c" />
                      <span>{flyer.location}</span>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.84rem', color: '#94a3b8', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                    {flyer.description}
                  </p>
                </div>

                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                    Posted by {flyer.postedBy} • {flyer.createdAt}
                  </span>

                  {flyer.externalLink ? (
                    <a
                      href={flyer.externalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.76rem', color: '#00f59b', borderColor: 'rgba(0, 245, 155, 0.4)' }}
                    >
                      <span>Event Info</span>
                      <ExternalLink size={12} />
                    </a>
                  ) : (
                    <span style={{ fontSize: '0.74rem', color: '#00f59b', fontWeight: 700 }}>
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
