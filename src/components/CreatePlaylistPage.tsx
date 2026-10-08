import React, { useState } from 'react';
import {
  ListMusic,
  Plus,
  Play,
  Pause,
  Trash2,
  X,
  Search,
  CheckCircle2,
  Download,
  FolderPlus,
  Disc3
} from 'lucide-react';
import type { Playlist, Song, User } from '../types';

interface CreatePlaylistPageProps {
  playlists: Playlist[];
  songs: Song[];
  currentSong: Song | null;
  isPlaying: boolean;
  onPlaySong: (song: Song) => void;
  onCreatePlaylist: (name: string, description: string, songIds: string[]) => void;
  onDeletePlaylist: (id: string) => void;
  onRemoveSongFromPlaylist: (playlistId: string, songId: string) => void;
  currentUser: User | null;
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const CreatePlaylistPage: React.FC<CreatePlaylistPageProps> = ({
  playlists,
  songs,
  currentSong,
  isPlaying,
  onPlaySong,
  onCreatePlaylist,
  onDeletePlaylist,
  onRemoveSongFromPlaylist,
  currentUser,
  onOpenAuth
}) => {
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(
    playlists[0]?.id || null
  );

  // New playlist creation form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const [playlistDesc, setPlaylistDesc] = useState('');
  const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>([]);
  const [trackSearchQuery, setTrackSearchQuery] = useState('');
  const [onlyMixesFilter, setOnlyMixesFilter] = useState(false);
  const [formSuccessMessage, setFormSuccessMessage] = useState<string | null>(null);

  // If user is not logged in
  if (!currentUser) {
    return (
      <div className="page-container" style={{ padding: '60px 24px', textAlign: 'center' }}>
        <div
          style={{
            maxWidth: '520px',
            margin: '0 auto',
            background: 'rgba(15, 20, 36, 0.85)',
            border: '1px solid rgba(0, 245, 155, 0.25)',
            borderRadius: '20px',
            padding: '40px 32px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)'
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(0, 245, 155, 0.12)',
              color: '#00f59b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}
          >
            <ListMusic size={32} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '10px', color: '#ffffff' }}>
            Exclusive Member Feature
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '24px' }}>
            Curating and saving custom music mix playlists is available to verified Music Marshall members. Sign in or register with your VIP promo code to begin creating playlists.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onOpenAuth('login')}
            >
              Sign In to Your Account
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => onOpenAuth('register')}
            >
              Register with Code
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Filter songs for selection
  const filteredTracks = songs.filter((s) => {
    if (onlyMixesFilter && !s.isMix && s.duration < 240) return false;
    if (!trackSearchQuery.trim()) return true;
    const q = trackSearchQuery.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      s.artist.toLowerCase().includes(q) ||
      s.genre.toLowerCase().includes(q)
    );
  });

  const handleToggleTrack = (id: string) => {
    setSelectedTrackIds((prev) =>
      prev.includes(id) ? prev.filter((tId) => tId !== id) : [...prev, id]
    );
  };

  const handleSelectAllFiltered = () => {
    const ids = filteredTracks.map((t) => t.id);
    setSelectedTrackIds((prev) => Array.from(new Set([...prev, ...ids])));
  };

  const handleClearSelected = () => {
    setSelectedTrackIds([]);
  };

  const handleSubmitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playlistName.trim()) return;

    onCreatePlaylist(playlistName.trim(), playlistDesc.trim(), selectedTrackIds);
    setFormSuccessMessage(`✓ Playlist "${playlistName.trim()}" created successfully!`);
    setPlaylistName('');
    setPlaylistDesc('');
    setSelectedTrackIds([]);
    setIsFormOpen(false);

    setTimeout(() => {
      setFormSuccessMessage(null);
    }, 4000);
  };

  const formatDuration = (secs: number) => {
    if (isNaN(secs) || secs <= 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    if (m >= 60) {
      const h = Math.floor(m / 60);
      const remainingM = m % 60;
      return `${h}h ${remainingM}m`;
    }
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const selectedPlaylist = playlists.find((p) => p.id === selectedPlaylistId) || playlists[0] || null;
  const selectedPlaylistTracks = selectedPlaylist
    ? selectedPlaylist.songIds
        .map((id) => songs.find((s) => s.id === id))
        .filter((s): s is Song => Boolean(s))
    : [];

  const totalPlaylistDuration = selectedPlaylistTracks.reduce((acc, s) => acc + s.duration, 0);

  const handlePlayPlaylist = (playlist: Playlist) => {
    const plSongs = playlist.songIds
      .map((id) => songs.find((s) => s.id === id))
      .filter((s): s is Song => Boolean(s));
    if (plSongs.length > 0) {
      onPlaySong(plSongs[0]);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '1360px', margin: '0 auto' }}>
      {/* Page Title & Action Header */}
      <div
        className="section-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '28px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: '20px'
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(0, 245, 155, 0.1)',
              color: '#00f59b',
              padding: '4px 12px',
              borderRadius: '9999px',
              fontSize: '0.76rem',
              fontWeight: 800,
              marginBottom: '8px',
              border: '1px solid rgba(0, 245, 155, 0.25)'
            }}
          >
            <ListMusic size={13} />
            <span>PLAYLIST CREATION STUDIO</span>
          </div>
          <h1
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              margin: '0 0 6px 0'
            }}
          >
            Create & Curate Playlists
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.92rem', margin: 0, maxWidth: '640px' }}>
            Build and organize your customized playlists from continuous music mixes and high-fidelity studio master tracks.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setIsFormOpen((prev) => !prev)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            fontSize: '0.9rem',
            fontWeight: 700
          }}
        >
          {isFormOpen ? <X size={16} /> : <Plus size={16} />}
          <span>{isFormOpen ? 'Cancel Builder' : '+ Create New Playlist'}</span>
        </button>
      </div>

      {/* Success Notification Alert */}
      {formSuccessMessage && (
        <div
          style={{
            background: 'rgba(0, 245, 155, 0.15)',
            border: '1px solid #00f59b',
            color: '#00f59b',
            padding: '12px 18px',
            borderRadius: '12px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: 700,
            fontSize: '0.9rem'
          }}
        >
          <CheckCircle2 size={18} />
          <span>{formSuccessMessage}</span>
        </div>
      )}

      {/* =========================================================================
          CREATE PLAYLIST BUILDER (Toggleable form)
          ========================================================================= */}
      {isFormOpen && (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(15, 20, 36, 0.95) 0%, rgba(9, 13, 24, 0.98) 100%)',
            border: '1px solid rgba(0, 245, 155, 0.35)',
            borderRadius: '18px',
            padding: '28px',
            marginBottom: '36px',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.5)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(0, 245, 155, 0.15)',
                  color: '#00f59b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <FolderPlus size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                  New Playlist Builder
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Name your set and select the music mixes or tracks to include
                </span>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setIsFormOpen(false)}
            >
              <X size={15} />
            </button>
          </div>

          <form onSubmit={handleSubmitCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px', marginBottom: '22px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '6px', color: '#cbd5e1' }}>
                  Playlist Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rocksteady Roots & Dub Mixes"
                  value={playlistName}
                  onChange={(e) => setPlaylistName(e.target.value)}
                  className="form-control"
                  style={{ width: '100%', fontSize: '0.95rem' }}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '6px', color: '#cbd5e1' }}>
                  Description (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. My favorite Wayne Armond acoustic tracks and party medleys"
                  value={playlistDesc}
                  onChange={(e) => setPlaylistDesc(e.target.value)}
                  className="form-control"
                  style={{ width: '100%', fontSize: '0.95rem' }}
                />
              </div>
            </div>

            {/* Track Picker Area */}
            <div
              style={{
                background: 'rgba(7, 9, 14, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '14px',
                padding: '18px',
                marginBottom: '22px'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                  marginBottom: '14px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#f8fafc' }}>
                    Select Tracks ({selectedTrackIds.length} selected)
                  </span>
                  <button
                    type="button"
                    onClick={() => setOnlyMixesFilter((prev) => !prev)}
                    className="btn btn-outline btn-sm"
                    style={{
                      padding: '4px 10px',
                      fontSize: '0.74rem',
                      color: onlyMixesFilter ? '#00f59b' : '#94a3b8',
                      borderColor: onlyMixesFilter ? '#00f59b' : 'rgba(255, 255, 255, 0.12)'
                    }}
                  >
                    {onlyMixesFilter ? '🔥 Mixes Only (Active)' : 'Show All Catalog'}
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ position: 'relative', width: '220px' }}>
                    <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: '#64748b' }} />
                    <input
                      type="text"
                      placeholder="Search tracks..."
                      value={trackSearchQuery}
                      onChange={(e) => setTrackSearchQuery(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px 10px 6px 30px',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#ffffff',
                        fontSize: '0.82rem'
                      }}
                    />
                  </div>

                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={handleSelectAllFiltered}
                    style={{ fontSize: '0.76rem', padding: '5px 10px' }}
                  >
                    Select All
                  </button>
                  {selectedTrackIds.length > 0 && (
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={handleClearSelected}
                      style={{ fontSize: '0.76rem', padding: '5px 10px' }}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Scrollable Track Selection List */}
              <div
                style={{
                  maxHeight: '260px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                {filteredTracks.map((song) => {
                  const isSelected = selectedTrackIds.includes(song.id);
                  return (
                    <div
                      key={song.id}
                      onClick={() => handleToggleTrack(song.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        background: isSelected ? 'rgba(0, 245, 155, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                        border: `1px solid ${isSelected ? 'rgba(0, 245, 155, 0.35)' : 'rgba(255, 255, 255, 0.05)'}`,
                        cursor: 'pointer',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}} // handled by parent onClick
                          style={{ accentColor: '#00f59b', cursor: 'pointer' }}
                        />
                        <img
                          src={song.coverUrl || '/headphone_logo.png'}
                          alt={song.title}
                          style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }}
                        />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '0.86rem', fontWeight: 700, color: isSelected ? '#00f59b' : '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {song.title}
                          </div>
                          <div style={{ fontSize: '0.76rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {song.artist} • {song.genre}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        {song.isMix && (
                          <span
                            style={{
                              background: 'rgba(56, 189, 248, 0.15)',
                              color: '#38bdf8',
                              fontSize: '0.68rem',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontWeight: 700
                            }}
                          >
                            MIX
                          </span>
                        )}
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          {formatDuration(song.duration)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setIsFormOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ padding: '10px 24px', fontWeight: 800 }}
              >
                Save & Create Playlist
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =========================================================================
          PLAYLISTS OVERVIEW & DETAIL CARDS
          ========================================================================= */}
      {playlists.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'rgba(15, 20, 36, 0.5)',
            border: '1px dashed rgba(255, 255, 255, 0.15)',
            borderRadius: '16px'
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(0, 245, 155, 0.1)',
              color: '#00f59b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}
          >
            <FolderPlus size={26} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '6px', color: '#ffffff' }}>
            No Playlists Created Yet
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '20px' }}>
            Start building your custom music mix sets by clicking the button below.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsFormOpen(true)}
          >
            <Plus size={16} />
            <span>Create Your First Playlist</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '40px' }}>
          {/* Left Column: Playlist Cards Selector */}
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '14px', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ListMusic size={18} color="#00f59b" />
              <span>Your Playlists ({playlists.length})</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {playlists.map((pl) => {
                const isSelected = selectedPlaylist?.id === pl.id;
                const plSongs = pl.songIds
                  .map((id) => songs.find((s) => s.id === id))
                  .filter((s): s is Song => Boolean(s));
                const plDur = plSongs.reduce((acc, s) => acc + s.duration, 0);

                return (
                  <div
                    key={pl.id}
                    onClick={() => setSelectedPlaylistId(pl.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px',
                      borderRadius: '14px',
                      background: isSelected
                        ? 'linear-gradient(135deg, rgba(0, 245, 155, 0.12) 0%, rgba(15, 20, 36, 0.95) 100%)'
                        : 'rgba(15, 20, 36, 0.6)',
                      border: `1px solid ${isSelected ? '#00f59b' : 'rgba(255, 255, 255, 0.08)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: isSelected ? '0 8px 24px rgba(0, 245, 155, 0.12)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                      <div
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '10px',
                          background: isSelected ? 'rgba(0, 245, 155, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <Disc3 size={24} color={isSelected ? '#00f59b' : '#94a3b8'} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#ffffff', margin: '0 0 2px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {pl.name}
                        </h4>
                        <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>
                          {pl.songIds.length} tracks • {formatDuration(plDur)}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayPlaylist(pl);
                        }}
                        title="Play entire playlist"
                        style={{ padding: '6px 12px' }}
                      >
                        <Play size={14} fill="currentColor" />
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete playlist "${pl.name}"?`)) {
                            onDeletePlaylist(pl.id);
                          }
                        }}
                        title="Delete playlist"
                        style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)', padding: '6px 10px' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Selected Playlist Details & Track List */}
          <div>
            {selectedPlaylist ? (
              <div
                style={{
                  background: 'rgba(15, 20, 36, 0.85)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: '24px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#00f59b', fontWeight: 800 }}>
                      Selected Playlist
                    </span>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', margin: '4px 0' }}>
                      {selectedPlaylist.name}
                    </h3>
                    {selectedPlaylist.description && (
                      <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0 0 6px 0' }}>
                        {selectedPlaylist.description}
                      </p>
                    )}
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      {selectedPlaylistTracks.length} tracks • Total playtime: {formatDuration(totalPlaylistDuration)}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => handlePlayPlaylist(selectedPlaylist)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                  >
                    <Play size={16} fill="currentColor" />
                    <span>Play Playlist</span>
                  </button>
                </div>

                {/* Track List inside selected playlist */}
                {selectedPlaylistTracks.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '36px 16px', color: '#64748b' }}>
                    <p style={{ margin: 0, fontSize: '0.88rem' }}>
                      This playlist has no tracks yet. Add tracks using the builder above.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedPlaylistTracks.map((song, idx) => {
                      const isCurrentPlaying = currentSong?.id === song.id && isPlaying;
                      return (
                        <div
                          key={song.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 14px',
                            borderRadius: '10px',
                            background: isCurrentPlaying ? 'rgba(0, 245, 155, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                            border: `1px solid ${isCurrentPlaying ? 'rgba(0, 245, 155, 0.3)' : 'rgba(255, 255, 255, 0.05)'}`,
                            transition: 'background 0.15s ease'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                            <span style={{ width: '20px', fontSize: '0.8rem', color: '#64748b', textAlign: 'center' }}>
                              {idx + 1}
                            </span>
                            <img
                              src={song.coverUrl || '/headphone_logo.png'}
                              alt={song.title}
                              style={{ width: '38px', height: '38px', borderRadius: '8px', objectFit: 'cover' }}
                            />
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: isCurrentPlaying ? '#00f59b' : '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {song.title}
                              </div>
                              <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                                {song.artist}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                              {formatDuration(song.duration)}
                            </span>

                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              onClick={() => onPlaySong(song)}
                              title={isCurrentPlaying ? 'Pause' : 'Play Track'}
                              style={{ padding: '6px 10px', color: isCurrentPlaying ? '#00f59b' : '#ffffff' }}
                            >
                              {isCurrentPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                            </button>

                            {song.isDownloadable && (
                              <a
                                href={song.audioUrl}
                                download={`${song.title}.mp3`}
                                className="btn btn-outline btn-sm"
                                style={{ padding: '6px 10px', color: '#16a34a' }}
                                title="Download Audio"
                              >
                                <Download size={14} />
                              </a>
                            )}

                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              onClick={() => onRemoveSongFromPlaylist(selectedPlaylist.id, song.id)}
                              title="Remove from playlist"
                              style={{ padding: '6px 10px', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
