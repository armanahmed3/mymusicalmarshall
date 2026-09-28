import React, { useState } from 'react';
import {
  Play,
  Pause,
  Plus,
  Trash2,
  ListMusic,
  X,
  Download,
  FolderPlus
} from 'lucide-react';
import type { Playlist, Song, User } from '../types';

interface PlaylistsViewProps {
  playlists: Playlist[];
  songs: Song[];
  currentSong: Song | null;
  isPlaying: boolean;
  onPlaySong: (song: Song) => void;
  onCreatePlaylist: (name: string, description: string, songIds: string[]) => void;
  onDeletePlaylist: (id: string) => void;
  onRemoveSongFromPlaylist: (playlistId: string, songId: string) => void;
  currentUser: User | null;
  createModalOpen: boolean;
  onCloseCreateModal: () => void;
  onOpenCreateModal: () => void;
  preselectedSongId?: string | null;
}

export const PlaylistsView: React.FC<PlaylistsViewProps> = ({
  playlists,
  songs,
  currentSong,
  isPlaying,
  onPlaySong,
  onCreatePlaylist,
  onDeletePlaylist,
  onRemoveSongFromPlaylist,
  createModalOpen,
  onCloseCreateModal,
  onOpenCreateModal,
  preselectedSongId
}) => {
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(playlists[0] || null);

  // Create Modal local form state
  const [newPlName, setNewPlName] = useState('');
  const [newPlDesc, setNewPlDesc] = useState('');
  const [selectedSongIds, setSelectedSongIds] = useState<string[]>(preselectedSongId ? [preselectedSongId] : []);

  React.useEffect(() => {
    if (preselectedSongId) {
      setSelectedSongIds([preselectedSongId]);
    }
  }, [preselectedSongId, createModalOpen]);

  const mixesAndSongs = songs;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlName.trim()) return;
    onCreatePlaylist(newPlName.trim(), newPlDesc.trim(), selectedSongIds);
    setNewPlName('');
    setNewPlDesc('');
    setSelectedSongIds([]);
    onCloseCreateModal();
  };

  const toggleSelectSong = (id: string) => {
    setSelectedSongIds((prev) =>
      prev.includes(id) ? prev.filter((sId) => sId !== id) : [...prev, id]
    );
  };

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const getPlaylistSongs = (pl: Playlist): Song[] => {
    return pl.songIds
      .map((id) => songs.find((s) => s.id === id))
      .filter((s): s is Song => Boolean(s));
  };

  return (
    <div className="page-container">
      {/* Header Banner */}
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ListMusic size={24} color="#16a34a" />
            <span>Music Mix Playlists</span>
          </h2>
          <p className="section-subtitle">
            Curate custom playlists from the list of continuous music mixes and studio masters.
          </p>
        </div>

        <button
          className="btn btn-primary"
          style={{ background: '#16a34a', borderColor: '#16a34a', display: 'flex', alignItems: 'center', gap: '8px' }}
          onClick={onOpenCreateModal}
        >
          <FolderPlus size={16} />
          <span>+ Create New Playlist</span>
        </button>
      </div>

      {/* Main Grid: Playlist List & Selected Playlist Details */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedPlaylist ? '340px 1fr' : '1fr', gap: '24px', marginTop: '20px' }}>
        {/* Left column: Playlist cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Your Playlists ({playlists.length})
          </div>

          {playlists.length === 0 ? (
            <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '12px', padding: '32px 16px', textAlign: 'center' }}>
              <ListMusic size={32} color="#94a3b8" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>No playlists yet</div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 12px 0' }}>
                Create your first playlist from the list of music mixes.
              </p>
              <button className="btn btn-primary btn-sm" onClick={onOpenCreateModal}>
                <Plus size={14} /> Create Playlist
              </button>
            </div>
          ) : (
            playlists.map((pl) => {
              const isSelected = selectedPlaylist?.id === pl.id;
              const plSongs = getPlaylistSongs(pl);
              const totalSecs = plSongs.reduce((acc, s) => acc + s.duration, 0);

              return (
                <div
                  key={pl.id}
                  onClick={() => setSelectedPlaylist(pl)}
                  style={{
                    background: isSelected ? '#ffffff' : '#f8fafc',
                    border: isSelected ? '2px solid #16a34a' : '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '14px',
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 8px 20px -4px rgba(22, 163, 74, 0.15)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div
                      style={{
                        width: '54px',
                        height: '54px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        background: '#0f172a',
                        flexShrink: 0
                      }}
                    >
                      <img
                        src={pl.coverUrl || plSongs[0]?.coverUrl || '/mm_logo.jpg'}
                        alt={pl.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 800,
                          fontSize: '0.92rem',
                          color: '#0f172a',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {pl.name}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                        {pl.songIds.length} tracks • {Math.round(totalSecs / 60)} min
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '2px' }}>
                        By {pl.createdBy}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right column: Selected Playlist Inspector / Track Viewer */}
        {selectedPlaylist && (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                  <img
                    src={selectedPlaylist.coverUrl || '/mm_banner.png'}
                    alt={selectedPlaylist.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', background: '#dcfce7', color: '#15803d', fontWeight: 800, padding: '2px 8px', borderRadius: '9999px' }}>
                    PLAYLIST
                  </span>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 900, margin: '4px 0 2px 0', color: '#0f172a' }}>
                    {selectedPlaylist.name}
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 4px 0' }}>
                    {selectedPlaylist.description || 'Custom mix playlist.'}
                  </p>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    {selectedPlaylist.songIds.length} mixes/tracks • Created {selectedPlaylist.createdAt}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {getPlaylistSongs(selectedPlaylist).length > 0 && (
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ background: '#16a34a', borderColor: '#16a34a' }}
                    onClick={() => {
                      const first = getPlaylistSongs(selectedPlaylist)[0];
                      if (first) onPlaySong(first);
                    }}
                  >
                    <Play size={14} fill="currentColor" /> Play Playlist
                  </button>
                )}
                <button
                  className="btn btn-outline btn-sm"
                  style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                  onClick={() => {
                    if (confirm(`Delete playlist "${selectedPlaylist.name}"?`)) {
                      onDeletePlaylist(selectedPlaylist.id);
                      setSelectedPlaylist(null);
                    }
                  }}
                  title="Delete playlist"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Song Table inside Playlist */}
            {getPlaylistSongs(selectedPlaylist).length === 0 ? (
              <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '10px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                This playlist is currently empty. Go to <strong>Master Mixes</strong> and click "+ Playlist" to add mixes!
              </div>
            ) : (
              <table className="song-table">
                <thead>
                  <tr>
                    <th className="col-num">#</th>
                    <th>Mix / Track Title</th>
                    <th>Genre & BPM</th>
                    <th>Length</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getPlaylistSongs(selectedPlaylist).map((song, index) => {
                    const isThisPlaying = currentSong?.id === song.id && isPlaying;
                    return (
                      <tr key={`${song.id}-${index}`} className={currentSong?.id === song.id ? 'active' : ''}>
                        <td className="col-num">
                          <button
                            className="play-btn-circle"
                            onClick={() => onPlaySong(song)}
                            style={{
                              background: currentSong?.id === song.id ? '#16a34a' : '#0f172a',
                              color: '#fff',
                              border: 'none',
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer'
                            }}
                          >
                            {isThisPlaying ? <Pause size={12} /> : <Play size={12} fill="currentColor" />}
                          </button>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <img
                              src={song.coverUrl || '/mm_logo.jpg'}
                              alt={song.title}
                              style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' }}
                            />
                            <div>
                              <div style={{ fontWeight: 700, color: '#0f172a' }}>{song.title}</div>
                              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{song.artist}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.78rem', color: '#475569' }}>
                            {song.genre} • {song.bpm} BPM
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                            {formatDuration(song.duration)}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                            {song.isDownloadable && (
                              <a
                                href={song.audioUrl}
                                download={`${song.title} - ${song.artist}.mp3`}
                                className="btn btn-outline btn-sm"
                                style={{ padding: '4px 8px', color: '#16a34a', borderColor: '#86efac' }}
                                title="Download audio mix"
                              >
                                <Download size={12} />
                              </a>
                            )}
                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              style={{ padding: '4px 8px', color: '#dc2626', borderColor: '#fca5a5' }}
                              onClick={() => onRemoveSongFromPlaylist(selectedPlaylist.id, song.id)}
                              title="Remove from playlist"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* ======================================================================
          CREATE PLAYLIST MODAL
          ====================================================================== */}
      {createModalOpen && (
        <div className="auth-overlay">
          <div className="auth-modal" style={{ maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto' }}>
            <button className="modal-close-btn" onClick={onCloseCreateModal} aria-label="Close modal">
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ background: '#16a34a', padding: '10px', borderRadius: '10px', color: '#fff' }}>
                <FolderPlus size={22} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  Create New Playlist
                </h2>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0 0' }}>
                  Select from the list of continuous music mixes and studio masters to build your playlist.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label>Playlist Name</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  placeholder="e.g., Weekend Soundclash Marathon"
                  value={newPlName}
                  onChange={(e) => setNewPlName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Description (Optional)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g., High-energy continuous reggae & dancehall mixes"
                  value={newPlDesc}
                  onChange={(e) => setNewPlDesc(e.target.value)}
                />
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ margin: 0 }}>Select Music Mixes to Include ({selectedSongIds.length} selected)</label>
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', color: '#16a34a', fontSize: '0.76rem', fontWeight: 700, cursor: 'pointer' }}
                    onClick={() => {
                      if (selectedSongIds.length === mixesAndSongs.length) {
                        setSelectedSongIds([]);
                      } else {
                        setSelectedSongIds(mixesAndSongs.map((s) => s.id));
                      }
                    }}
                  >
                    {selectedSongIds.length === mixesAndSongs.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                <div
                  style={{
                    maxHeight: '260px',
                    overflowY: 'auto',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '6px'
                  }}
                >
                  {mixesAndSongs.map((mix) => {
                    const isChecked = selectedSongIds.includes(mix.id);
                    return (
                      <div
                        key={mix.id}
                        onClick={() => toggleSelectSong(mix.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 10px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          background: isChecked ? '#f0fdf4' : 'transparent',
                          borderBottom: '1px solid #f8fafc'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // handled by parent div
                          style={{ accentColor: '#16a34a' }}
                        />
                        <img
                          src={mix.coverUrl || '/mm_logo.jpg'}
                          alt={mix.title}
                          style={{ width: '32px', height: '32px', borderRadius: '4px', objectFit: 'cover' }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: '0.84rem', color: '#0f172a' }}>
                            {mix.title} {mix.isMix ? '🔥 (Mix)' : ''}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                            {mix.artist} • {formatDuration(mix.duration)} • {mix.genre}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={onCloseCreateModal}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1.5, background: '#16a34a', borderColor: '#16a34a' }}
                  disabled={!newPlName.trim()}
                >
                  Create Playlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
