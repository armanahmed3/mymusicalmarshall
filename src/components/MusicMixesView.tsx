import React, { useState } from 'react';
import {
  Play,
  Pause,
  Plus,
  Download,
  Disc3,
  Clock,
  ListPlus,
  Repeat,
  CheckCircle2,
  FolderPlus
} from 'lucide-react';
import type { Song, Playlist, User } from '../types';

interface MusicMixesViewProps {
  songs: Song[];
  currentSong: Song | null;
  isPlaying: boolean;
  onPlaySong: (song: Song) => void;
  onOpenCreatePlaylist: (preselectedMixId?: string) => void;
  onAddToPlaylist: (mixId: string, playlistId: string) => void;
  playlists: Playlist[];
  currentUser?: User | null;
  repeatMixLoop: boolean;
  onToggleLoop: () => void;
}

export const MusicMixesView: React.FC<MusicMixesViewProps> = ({
  songs,
  currentSong,
  isPlaying,
  onPlaySong,
  onOpenCreatePlaylist,
  onAddToPlaylist,
  playlists,
  currentUser,
  repeatMixLoop,
  onToggleLoop
}) => {
  // Filter mixes: explicitly marked isMix OR duration >= 240 seconds
  const mixes = songs.filter((s) => s.isMix || s.duration >= 240);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchMixQuery, setSearchMixQuery] = useState<string>('');
  const [playlistDropdownMixId, setPlaylistDropdownMixId] = useState<string | null>(null);

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60);
      const remainingMins = mins % 60;
      return `${hrs}h ${remainingMins}m`;
    }
    return `${mins}m ${s < 10 ? '0' : ''}${s}s`;
  };

  const filteredMixes = mixes.filter((mix) => {
    const matchesSearch =
      mix.title.toLowerCase().includes(searchMixQuery.toLowerCase()) ||
      mix.artist.toLowerCase().includes(searchMixQuery.toLowerCase()) ||
      mix.genre.toLowerCase().includes(searchMixQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'downloadable') return mix.isDownloadable;
    if (selectedCategory === 'juggling') return mix.genre.toLowerCase().includes('dancehall') || mix.genre.toLowerCase().includes('juggling');
    if (selectedCategory === 'tribute') return mix.title.toLowerCase().includes('ellis') || mix.title.toLowerCase().includes('armond');
    if (selectedCategory === 'afrobeat') return mix.genre.toLowerCase().includes('afro');
    return true;
  });

  return (
    <div className="page-container">
      {/* Header Banner */}
      <div className="hero-card" style={{ background: 'linear-gradient(135deg, #090d16 0%, #172554 100%)', color: '#fff' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '4px 10px', borderRadius: '9999px', fontSize: '0.78rem', color: '#38bdf8', fontWeight: 800, marginBottom: '12px' }}>
            <Disc3 size={14} />
            <span>AUTHENTIC MUSIC MARSHALL DJ JUGGLINGS & SESSIONS</span>
          </div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 900, margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
            Master Music Mixes
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.92rem', margin: '0 0 18px 0', maxWidth: '620px', lineHeight: 1.5 }}>
            Continuous multi-track sessions, high-energy dancehall jugglings, Rocksteady tributes, and extended studio vocal cuts. Select any mix to play instantly.
          </p>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              className="btn btn-primary"
              style={{ background: '#16a34a', borderColor: '#16a34a' }}
              onClick={() => onOpenCreatePlaylist()}
            >
              <ListPlus size={16} />
              <span>Create Playlist from Mixes</span>
            </button>

            <button
              className="btn btn-outline"
              style={{
                borderColor: repeatMixLoop ? '#16a34a' : 'rgba(255,255,255,0.3)',
                color: repeatMixLoop ? '#22c55e' : '#ffffff',
                background: repeatMixLoop ? 'rgba(34, 197, 94, 0.15)' : 'transparent'
              }}
              onClick={onToggleLoop}
              title="Toggle loop mode for selected mixes"
            >
              <Repeat size={15} />
              <span>Loop Mix on End: {repeatMixLoop ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </div>

        <div style={{ width: '130px', height: '130px', borderRadius: '16px', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
          <img src="/mm_banner.png" alt="Mix Deck" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '24px 0 16px 0', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: `All Mixes (${mixes.length})` },
            ...(currentUser?.role === 'admin' ? [{ id: 'downloadable', label: '⬇ Downloadable' }] : []),
            { id: 'juggling', label: 'Dancehall Juggling' },
            { id: 'tribute', label: 'Tributes & Rocksteady' },
            { id: 'afrobeat', label: 'Afrobeat Meets R&B' }
          ].map((cat) => (
            <button
              key={cat.id}
              className={`btn btn-sm ${selectedCategory === cat.id ? 'btn-primary' : 'btn-outline'}`}
              style={{ borderRadius: '9999px', fontSize: '0.8rem', padding: '5px 12px' }}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div style={{ minWidth: '220px', flex: '1', maxWidth: '320px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search mixes by title or DJ..."
            value={searchMixQuery}
            onChange={(e) => setSearchMixQuery(e.target.value)}
            style={{ fontSize: '0.84rem', padding: '7px 12px' }}
          />
        </div>
      </div>

      {/* Mix Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {filteredMixes.map((mix) => {
          const isCurrentPlaying = currentSong?.id === mix.id && isPlaying;
          const isCurrentActive = currentSong?.id === mix.id;

          return (
            <div
              key={mix.id}
              style={{
                background: '#ffffff',
                border: isCurrentActive ? '2px solid #16a34a' : '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: isCurrentActive ? '0 10px 25px -5px rgba(22, 163, 74, 0.2)' : '0 4px 12px rgba(0,0,0,0.03)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
            >
              <div>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div
                    style={{
                      position: 'relative',
                      width: '72px',
                      height: '72px',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      flexShrink: 0,
                      cursor: 'pointer'
                    }}
                    onClick={() => onPlaySong(mix)}
                  >
                    <img
                      src={mix.coverUrl || '/mm_logo.jpg'}
                      alt={mix.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(0,0,0,0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        transition: 'opacity 0.2s'
                      }}
                    >
                      {isCurrentPlaying ? <Pause size={24} fill="white" /> : <Play size={24} fill="white" />}
                    </div>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '4px' }}>
                      <span
                        style={{
                          background: '#dbeafe',
                          color: '#1e40af',
                          fontWeight: 800,
                          fontSize: '0.68rem',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}
                      >
                        MIX / SESSION
                      </span>
                      {currentUser?.role === 'admin' && (
                        mix.isDownloadable ? (
                          <span
                            style={{
                              background: '#dcfce7',
                              color: '#15803d',
                              fontWeight: 800,
                              fontSize: '0.68rem',
                              padding: '2px 6px',
                              borderRadius: '4px'
                            }}
                          >
                            DOWNLOADABLE
                          </span>
                        ) : (
                          <span
                            style={{
                              background: '#f1f5f9',
                              color: '#64748b',
                              fontWeight: 600,
                              fontSize: '0.68rem',
                              padding: '2px 6px',
                              borderRadius: '4px'
                            }}
                          >
                            STREAM ONLY
                          </span>
                        )
                      )}
                    </div>

                    <h3
                      style={{
                        fontSize: '0.96rem',
                        fontWeight: 800,
                        margin: '0 0 2px 0',
                        color: '#0f172a',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        cursor: 'pointer'
                      }}
                      onClick={() => onPlaySong(mix)}
                      title={mix.title}
                    >
                      {mix.title}
                    </h3>
                    {mix.artist?.trim() ? (
                      <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
                        {mix.artist}
                      </div>
                    ) : null}
                  </div>
                </div>

                <p
                  style={{
                    fontSize: '0.78rem',
                    color: '#64748b',
                    margin: '0 0 12px 0',
                    lineHeight: 1.4,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {mix.description || `${mix.genre} master studio mix. High fidelity continuous audio.`}
                </p>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '0.74rem',
                    color: '#64748b',
                    marginBottom: '14px',
                    background: '#f8fafc',
                    padding: '6px 10px',
                    borderRadius: '6px'
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
                    <Clock size={12} /> {formatDuration(mix.duration)}
                  </span>
                  <span>•</span>
                  <span>{mix.genre}</span>
                  <span>•</span>
                  <span>{mix.bpm} BPM</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', position: 'relative' }}>
                <button
                  type="button"
                  className={`btn btn-sm ${isCurrentPlaying ? 'btn-outline' : 'btn-primary'}`}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  onClick={() => onPlaySong(mix)}
                >
                  {isCurrentPlaying ? (
                    <>
                      <Pause size={14} /> <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play size={14} fill="currentColor" /> <span>Play Mix</span>
                    </>
                  )}
                </button>

                {/* Add to Playlist button */}
                <div style={{ position: 'relative' }}>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    title="Add to Playlist"
                    onClick={() => {
                      if (playlists.length === 0) {
                        onOpenCreatePlaylist(mix.id);
                      } else {
                        setPlaylistDropdownMixId(playlistDropdownMixId === mix.id ? null : mix.id);
                      }
                    }}
                    style={{ padding: '6px 10px' }}
                  >
                    <Plus size={14} />
                    <span style={{ fontSize: '0.78rem' }}>Playlist</span>
                  </button>

                  {/* Playlist Dropdown */}
                  {playlistDropdownMixId === mix.id && (
                    <div
                      className="luxury-dropdown-menu"
                      style={{
                        bottom: 'calc(100% + 8px)',
                        right: 0,
                        minWidth: '220px',
                        transformOrigin: 'bottom right'
                      }}
                    >
                      <div className="luxury-dropdown-header" style={{ padding: '6px 10px 8px' }}>
                        <div className="luxury-dropdown-title">
                          <FolderPlus size={13} />
                          <span>Add to Playlist</span>
                        </div>
                      </div>
                      <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
                        {playlists.map((pl) => {
                          const alreadyIn = pl.songIds.includes(mix.id);
                          return (
                            <button
                              key={pl.id}
                              type="button"
                              className="luxury-dropdown-item"
                              onClick={() => {
                                onAddToPlaylist(mix.id, pl.id);
                                setPlaylistDropdownMixId(null);
                              }}
                            >
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {pl.name}
                              </span>
                              {alreadyIn && <CheckCircle2 size={14} color="#00f59b" style={{ flexShrink: 0 }} />}
                            </button>
                          );
                        })}
                      </div>
                      <div className="luxury-dropdown-divider" />
                      <button
                        type="button"
                        className="luxury-dropdown-item"
                        style={{ color: '#00f59b', fontWeight: 800 }}
                        onClick={() => {
                          setPlaylistDropdownMixId(null);
                          onOpenCreatePlaylist(mix.id);
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Plus size={14} />
                          <span>New Playlist</span>
                        </span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Download Mix Button - Admin Only */}
                {currentUser?.role === 'admin' && (
                  mix.isDownloadable ? (
                    <a
                      href={mix.audioUrl}
                      download={`${mix.title} - ${mix.artist}.mp3`}
                      className="btn btn-outline btn-sm"
                      style={{ padding: '6px 10px', color: '#16a34a', borderColor: '#86efac' }}
                      title="Download high-resolution audio mix"
                    >
                      <Download size={14} />
                    </a>
                  ) : (
                    <button
                      disabled
                      className="btn btn-outline btn-sm"
                      style={{ padding: '6px 10px', opacity: 0.4, cursor: 'not-allowed' }}
                      title="Download restricted for this studio release"
                    >
                      <Download size={14} />
                    </button>
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
