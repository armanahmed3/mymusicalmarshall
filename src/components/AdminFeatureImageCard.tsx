import React, { useState, useRef } from 'react';
import { Image as ImageIcon, Upload, Save, Calendar, Sparkles } from 'lucide-react';
import type { EventFlyer } from '../types';

interface AdminFeatureImageCardProps {
  landingFeatureImage: string;
  onSaveLandingFeatureImage: (url: string) => void;
  dashboardFeatureImage: string;
  onSaveDashboardFeatureImage: (url: string) => void;
  onAddEventFlyer: (flyer: Omit<EventFlyer, 'id' | 'createdAt' | 'postedBy'>) => void;
  onToast: (msg: string) => void;
}

export const AdminFeatureImageCard: React.FC<AdminFeatureImageCardProps> = ({
  landingFeatureImage,
  onSaveLandingFeatureImage,
  dashboardFeatureImage,
  onSaveDashboardFeatureImage,
  onAddEventFlyer,
  onToast
}) => {
  // Landing Page Feature Image
  const [landingUrl, setLandingUrl] = useState(landingFeatureImage);
  // Dashboard Feature Image (After Login)
  const [dashboardUrl, setDashboardUrl] = useState(dashboardFeatureImage);

  // Event Flyer Form
  const [flyerTitle, setFlyerTitle] = useState('');
  const [flyerDate, setFlyerDate] = useState('');
  const [flyerLocation, setFlyerLocation] = useState('');
  const [flyerDesc, setFlyerDesc] = useState('');
  const [flyerUrl, setFlyerUrl] = useState('/mm_banner.png');
  const [flyerLink, setFlyerLink] = useState('');

  const landingFileInputRef = useRef<HTMLInputElement | null>(null);
  const dashboardFileInputRef = useRef<HTMLInputElement | null>(null);
  const flyerFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleLandingFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setLandingUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDashboardFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setDashboardUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFlyerFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFlyerUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveLanding = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveLandingFeatureImage(landingUrl);
    onToast('Landing page feature image updated and saved!');
  };

  const handleSaveDashboard = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveDashboardFeatureImage(dashboardUrl);
    onToast('Dashboard (after-login) feature image updated and saved!');
  };

  const handlePostFlyer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flyerTitle.trim() || !flyerDate.trim()) return;

    onAddEventFlyer({
      title: flyerTitle.trim(),
      eventDate: flyerDate.trim(),
      location: flyerLocation.trim() || 'Music Marshall Studio Yard',
      description: flyerDesc.trim() || 'Official sound system event.',
      flyerUrl: flyerUrl || '/mm_banner.png',
      externalLink: flyerLink.trim() || undefined
    });

    setFlyerTitle('');
    setFlyerDate('');
    setFlyerLocation('');
    setFlyerDesc('');
    setFlyerLink('');
    onToast('Event flyer published to Notice Board!');
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginTop: '24px' }}>
      {/* 1. Assign Feature Image for Landing Page */}
      <div className="admin-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <ImageIcon size={18} color="#22c55e" />
          <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
            Landing Page Feature Image
          </h3>
        </div>
        <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0 0 14px 0' }}>
          Assign the visual hero banner displayed on the public landing page before sign in.
        </p>

        <form onSubmit={handleSaveLanding} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ width: '100%', height: '140px', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.12)', background: '#0b0f19' }}>
            <img src={landingUrl || '/mm_banner.png'} alt="Landing Banner Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          <input
            type="file"
            ref={landingFileInputRef}
            accept="image/*"
            onChange={handleLandingFile}
            style={{ display: 'none' }}
          />

          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Or enter image URL..."
              value={landingUrl}
              onChange={(e) => setLandingUrl(e.target.value)}
              style={{ fontSize: '0.8rem' }}
            />
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => landingFileInputRef.current?.click()}
              title="Upload image file"
            >
              <Upload size={14} />
            </button>
          </div>

          <button type="submit" className="btn btn-primary btn-sm" style={{ background: '#16a34a', borderColor: '#16a34a' }}>
            <Save size={14} /> Save Landing Feature Image
          </button>
        </form>
      </div>

      {/* 2. Assign Feature Image for Landing Page After Login (Dashboard) */}
      <div className="admin-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Sparkles size={18} color="#3b82f6" />
          <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
            After-Login (Dashboard) Feature Image
          </h3>
        </div>
        <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0 0 14px 0' }}>
          Assign the header feature image displayed on the Music Lab dashboard after user login.
        </p>

        <form onSubmit={handleSaveDashboard} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ width: '100%', height: '140px', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.12)', background: '#0b0f19' }}>
            <img src={dashboardUrl || '/mm_banner.png'} alt="Dashboard Banner Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          <input
            type="file"
            ref={dashboardFileInputRef}
            accept="image/*"
            onChange={handleDashboardFile}
            style={{ display: 'none' }}
          />

          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Or enter image URL..."
              value={dashboardUrl}
              onChange={(e) => setDashboardUrl(e.target.value)}
              style={{ fontSize: '0.8rem' }}
            />
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => dashboardFileInputRef.current?.click()}
              title="Upload image file"
            >
              <Upload size={14} />
            </button>
          </div>

          <button type="submit" className="btn btn-primary btn-sm" style={{ background: '#2563eb', borderColor: '#2563eb' }}>
            <Save size={14} /> Save After-Login Feature Image
          </button>
        </form>
      </div>

      {/* 3. Upload / Post Event Flyers to Notice Board */}
      <div className="admin-card" style={{ gridColumn: '1 / -1' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Calendar size={18} color="#ea580c" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
            Upload & Post Event Flyer to Notice Board
          </h3>
        </div>
        <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0 0 16px 0' }}>
          Post upcoming live sessions, concerts, dub yards, and announcements to the public & member Notice Board.
        </p>

        <form onSubmit={handlePostFlyer} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            <div className="form-group">
              <label>Event Title</label>
              <input
                type="text"
                required
                className="form-control"
                placeholder="e.g., Music Marshall Reggae Roots Festival 2026"
                value={flyerTitle}
                onChange={(e) => setFlyerTitle(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Event Date & Time</label>
              <input
                type="text"
                required
                className="form-control"
                placeholder="e.g., Saturday, Nov 21, 2026 • 9:00 PM EST"
                value={flyerDate}
                onChange={(e) => setFlyerDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Venue / Location</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g., Studio Yard, Kingston / Live Stream"
                value={flyerLocation}
                onChange={(e) => setFlyerLocation(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label>Event Description</label>
              <textarea
                rows={3}
                className="form-control"
                placeholder="Details about artists performing, sound systems, entry requirements..."
                value={flyerDesc}
                onChange={(e) => setFlyerDesc(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Flyer Artwork (Upload or URL)</label>
              <input
                type="file"
                ref={flyerFileInputRef}
                accept="image/*"
                onChange={handleFlyerFile}
                style={{ display: 'none' }}
              />
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="text"
                  className="form-control"
                  value={flyerUrl}
                  onChange={(e) => setFlyerUrl(e.target.value)}
                  style={{ fontSize: '0.8rem' }}
                />
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => flyerFileInputRef.current?.click()}
                  title="Upload flyer artwork file"
                >
                  <Upload size={14} />
                </button>
              </div>
              <div style={{ height: '70px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                <img src={flyerUrl || '/mm_banner.png'} alt="Flyer preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>External Ticket / Info Link (Optional)</label>
            <input
              type="url"
              className="form-control"
              placeholder="https://mymusicmarshall.com/event-details"
              value={flyerLink}
              onChange={(e) => setFlyerLink(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ background: '#ea580c', borderColor: '#ea580c', width: 'fit-content' }}>
            <Calendar size={15} /> Publish Flyer to Notice Board
          </button>
        </form>
      </div>
    </div>
  );
};
