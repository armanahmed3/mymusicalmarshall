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
          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Your Playlists ({playlists.length})
          </div>

          {playlists.length === 0 ? (
            <div style={{ background: 'rgba(15, 20, 36, 0.75)', border: '1px dashed rgba(255, 255, 255, 0.15)', borderRadius: '14px', padding: '32px 16px', textAlign: 'center' }}>
              <ListMusic size={32} color="#00f59b" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontWeight: 800, color: '#ffffff', marginBottom: '4px' }}>No playlists yet</div>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0 0 14px 0' }}>
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
                    background: isSelected ? 'rgba(0, 245, 155, 0.12)' : 'rgba(15, 20, 36, 0.75)',
                    border: isSelected ? '1.5px solid #00f59b' : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '14px',
                    padding: '14px',
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 8px 24px -4px rgba(0, 245, 155, 0.25)' : 'none',
                    transition: 'all 0.18s ease'
                  }}
                >
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div
                      style={{
                        width: '54px',
                        height: '54px',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        background: '#070a12',
                        flexShrink: 0,
                        border: '1px solid rgba(255, 255, 255, 0.1)'
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
                          color: '#ffffff',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {pl.name}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '2px' }}>
                        {pl.songIds.length} tracks • {Math.round(totalSecs / 60)} min
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>
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
          <div style={{ background: 'rgba(15, 20, 36, 0.85)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', padding: '24px', backdropFilter: 'blur(16px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <img
                    src={selectedPlaylist.coverUrl || '/mm_banner.png'}
                    alt={selectedPlaylist.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', background: 'rgba(0, 245, 155, 0.15)', color: '#00f59b', border: '1px solid rgba(0, 245, 155, 0.3)', fontWeight: 800, padding: '2px 8px', borderRadius: '9999px' }}>
                    PLAYLIST
                  </span>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 900, margin: '4px 0 2px 0', color: '#ffffff' }}>
                    {selectedPlaylist.name}
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '0 0 4px 0' }}>
                    {selectedPlaylist.description || 'Custom mix playlist.'}
                  </p>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {selectedPlaylist.songIds.length} mixes/tracks • Created {selectedPlaylist.createdAt}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {getPlaylistSongs(selectedPlaylist).length > 0 && (
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ background: '#00f59b', color: '#07090e', borderColor: '#00f59b', fontWeight: 800 }}
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
                  style={{ color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.35)' }}
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
              <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '28px', borderRadius: '12px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem', border: '1px dashed rgba(255,255,255,0.1)' }}>
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
                              background: currentSong?.id === song.id ? '#00f59b' : 'rgba(255,255,255,0.1)',
                              color: currentSong?.id === song.id ? '#07090e' : '#fff',
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
                              <div style={{ fontWeight: 700, color: '#ffffff' }}>{song.title}</div>
                              <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>{song.artist}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                            {song.genre} • {song.bpm} BPM
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
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
                                style={{ padding: '4px 8px', color: '#00f59b', borderColor: 'rgba(0, 245, 155, 0.4)' }}
                                title="Download audio mix"
                              >
                                <Download size={12} />
                              </a>
                            )}
                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              style={{ padding: '4px 8px', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.4)' }}
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
              <div style={{ background: 'rgba(0, 245, 155, 0.15)', border: '1px solid rgba(0, 245, 155, 0.3)', padding: '10px', borderRadius: '10px', color: '#00f59b' }}>
                <FolderPlus size={22} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                  Create New Playlist
                </h2>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
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
                    style={{ background: 'none', border: 'none', color: '#00f59b', fontSize: '0.76rem', fontWeight: 700, cursor: 'pointer' }}
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
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '10px',
                    padding: '6px',
                    background: 'rgba(11, 15, 26, 0.7)'
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
                          borderRadius: '8px',
                          cursor: 'pointer',
                          background: isChecked ? 'rgba(0, 245, 155, 0.12)' : 'transparent',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                          transition: 'background 0.15s ease'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // handled by parent div
                          style={{ accentColor: '#00f59b' }}
                        />
                        <img
                          src={mix.coverUrl || '/mm_logo.jpg'}
                          alt={mix.title}
                          style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: '0.84rem', color: '#ffffff' }}>
                            {mix.title} {mix.isMix ? '🔥 (Mix)' : ''}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
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
                  style={{ flex: 1.5 }}
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
