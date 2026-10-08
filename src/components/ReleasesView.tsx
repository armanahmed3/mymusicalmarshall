import { Play, Pause, Home } from 'lucide-react';
import type { Song } from '../types';

interface ReleasesViewProps {
  mmReleases: Song[];
  currentSong: Song | null;
  isPlaying: boolean;
  onPlaySong: (song: Song) => void;
  dashboardFeatureImage?: string;
  onNavigateHome: () => void;
}

export const ReleasesView: React.FC<ReleasesViewProps> = ({
  mmReleases,
  currentSong,
  isPlaying,
  onPlaySong,
  dashboardFeatureImage,
  onNavigateHome
}) => {
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="page-container" style={{ maxWidth: '1360px', margin: '0 auto' }}>
      {/* Hero Banner */}
      <div className="hero-card" style={{ background: 'linear-gradient(135deg, #052e16 0%, #0f172a 100%)', marginBottom: '32px' }}>
        <div className="hero-content">
          <span className="hero-pill" style={{ background: 'rgba(74, 222, 128, 0.2)', color: '#4ade80' }}>
            Official Releases • Free to Stream Without Login
          </span>
          <h1 className="hero-title">My MM Productions</h1>
          <p className="hero-desc">
            Official songs downloaded directly from <em>mymusicmarshall.com/Mix/ListReleases</em>. 
            These tracks are freely available to everyone without requiring an account.
          </p>
          <div className="hero-actions-group" style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            {mmReleases.length > 0 && (
              <button
                type="button"
                className="btn btn-accent btn-hero-lg"
                onClick={() => onPlaySong(mmReleases[0])}
              >
                <Play size={18} fill="white" />
                <span>Play {mmReleases[0].title}</span>
              </button>
            )}
            <button
              type="button"
              className="btn btn-outline btn-hero-lg hero-home-btn"
              style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.08)' }}
              onClick={onNavigateHome}
              title="Return to Home Page"
            >
              <Home size={18} />
              <span>Home Page</span>
            </button>
          </div>
        </div>
        <img
          src={dashboardFeatureImage || "/mm_banner.png"}
          alt="Music Marshall Banner"
          className="hero-banner-img"
        />
      </div>

      <div className="section-header" style={{ marginBottom: '20px' }}>
        <div>
          <h2 className="section-title">Official MM Productions ({mmReleases.length})</h2>
          <p className="section-subtitle">
            Streamable by all guests and members with zero restrictions
          </p>
        </div>
      </div>

      <div
        style={{
          background: 'rgba(15, 20, 36, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          overflow: 'hidden'
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table className="song-table" style={{ margin: 0 }}>
            <thead>
              <tr>
                <th>Title & Artist</th>
                <th>Album / Description</th>
                <th>Genre</th>
                <th>Duration</th>
                <th style={{ textAlign: 'center' }}>Stream</th>
              </tr>
            </thead>
            <tbody>
              {mmReleases.map((song) => {
                const isCurrent = currentSong?.id === song.id;
                return (
                  <tr
                    key={song.id}
                    className={`song-row ${isCurrent ? 'is-active' : ''}`}
                    onClick={() => onPlaySong(song)}
                  >
                    <td>
                      <div className="song-title-group">
                        <div style={{ position: 'relative', width: '40px', height: '40px', flexShrink: 0 }}>
                          <img
                            src="/headphone_logo.png"
                            alt={song.title}
                            className="song-cover-thumb"
                            style={{ width: '100%', height: '100%', margin: 0 }}
                          />
                          {isCurrent && isPlaying && (
                            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <div className="mini-equalizer">
                                <span className="eq-bar"></span>
                                <span className="eq-bar"></span>
                                <span className="eq-bar"></span>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="song-title-meta">
                          <span className="song-title">{song.title}</span>
                          {song.artist?.trim() ? <span className="song-artist">{song.artist}</span> : null}
                        </div>
                      </div>
                    </td>
                    <td style={{ color: '#64748b', fontSize: '0.86rem' }}>
                      {song.description || song.album}
                    </td>
                    <td>
                      <span className="badge badge-genre">{song.genre}</span>
                    </td>
                    <td style={{ color: '#64748b', fontSize: '0.86rem' }}>
                      {formatTime(song.duration)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        className="btn-play-table"
                        onClick={(e) => {
                          e.stopPropagation();
                          onPlaySong(song);
                        }}
                        title="Play Free (No Login Needed)"
                      >
                        {isCurrent && isPlaying ? (
                          <Pause size={18} fill="white" />
                        ) : (
                          <Play size={18} fill="white" />
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
