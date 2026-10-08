import React, { useState } from 'react';
import {
  Play,
  Pause,
  Plus,
  Download,
  Clock,
  CheckCircle2,
  FolderPlus,
  Search,
  Headphones
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
  repeatMixLoop?: boolean;
  onToggleLoop?: () => void;
}

export const MusicMixesView: React.FC<MusicMixesViewProps> = ({
  songs,
  currentSong,
  isPlaying,
  onPlaySong,
  onOpenCreatePlaylist,
  onAddToPlaylist,
  playlists,
  currentUser
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
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
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
    <div>
      {/* Clean View Header without huge box */}
      <div className="section-header" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', width: '100%' }}>
          <div>
            <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Headphones size={24} color="#00f59b" />
              <span>Master Music Mixes ({filteredMixes.length})</span>
            </h2>
            <p className="section-subtitle">
              Authentic sound system DJ jugglings, dancehall sessions, Rocksteady tributes, and extended studio mixes.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs and Search Bar (Clean toolbar) */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          margin: '0 0 20px 0',
          gap: '12px',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
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
              style={{ borderRadius: '9999px', fontSize: '0.8rem', padding: '5px 14px' }}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div style={{ minWidth: '240px', flex: '1', maxWidth: '320px', position: 'relative' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search mixes by title, DJ or genre..."
            value={searchMixQuery}
            onChange={(e) => setSearchMixQuery(e.target.value)}
            style={{ fontSize: '0.84rem', padding: '8px 14px 8px 34px' }}
          />
          <Search size={15} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
        </div>
      </div>

      {/* Table Format (Clean Home Page / Catalog Table Style - No Boxes) */}
      {filteredMixes.length === 0 ? (
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '12px',
            border: '1px dashed rgba(255, 255, 255, 0.12)',
            padding: '36px 20px',
            textAlign: 'center',
            color: '#94a3b8'
          }}
        >
          No music mixes matched your search or filter.
        </div>
      ) : (
        <table className="song-table">
          <thead>
            <tr>
              <th className="col-num">#</th>
              <th>Mix Title & DJ</th>
              <th>Album / Session Info</th>
              <th>Genre</th>
              <th>Duration</th>
              <th style={{ textAlign: 'center' }}>Stream</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMixes.map((mix, index) => {
              const isCurrent = currentSong?.id === mix.id;
              const isCurrentPlaying = isCurrent && isPlaying;

              return (
                <tr
                  key={mix.id}
                  className={`song-row ${isCurrent ? 'is-active' : ''}`}
                  onClick={() => onPlaySong(mix)}
                >
                  {/* Column 1: Number or Playing Equalizer */}
                  <td className="col-num">
                    {isCurrentPlaying ? (
                      <div className="mini-equalizer" title="Playing Now">
                        <span className="eq-bar"></span>
                        <span className="eq-bar"></span>
                        <span className="eq-bar"></span>
                      </div>
                    ) : (
                      index + 1
                    )}
                  </td>

                  {/* Column 2: Mix Cover, Title and Artist */}
                  <td>
                    <div className="song-title-group">
                      <div style={{ position: 'relative', width: '42px', height: '42px', flexShrink: 0 }}>
                        <img
                          src={mix.coverUrl || '/mm_logo.jpg'}
                          alt={mix.title}
                          className="song-cover-thumb"
                          style={{ width: '100%', height: '100%', borderRadius: '8px', margin: 0, objectFit: 'cover' }}
                        />
                        {isCurrentPlaying && (
                          <div
                            style={{
                              position: 'absolute',
                              inset: 0,
                              background: 'rgba(0,0,0,0.5)',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Pause size={16} fill="white" />
                          </div>
                        )}
                      </div>
                      <div className="song-title-meta">
                        <span className="song-title">{mix.title}</span>
                        {mix.artist?.trim() ? (
                          <span className="song-artist">{mix.artist}</span>
                        ) : (
                          <span className="song-artist" style={{ color: '#64748b' }}>Music Marshall Sound</span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Column 3: Description / Album */}
                  <td style={{ color: '#94a3b8', fontSize: '0.84rem', maxWidth: '280px' }}>
                    <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {mix.description || mix.album || 'Master Studio Session'}
                    </div>
                  </td>

                  {/* Column 4: Genre Badge */}
                  <td>
                    <span className="badge badge-genre">{mix.genre}</span>
                  </td>

                  {/* Column 5: Duration */}
                  <td style={{ color: '#94a3b8', fontSize: '0.86rem', whiteSpace: 'nowrap' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} color="#64748b" />
                      {formatDuration(mix.duration)}
                    </span>
                  </td>

                  {/* Column 6: Stream / Play */}
                  <td style={{ textAlign: 'center' }}>
                    <button
                      className="btn-play-table"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlaySong(mix);
                      }}
                      title={isCurrentPlaying ? 'Pause Mix' : 'Play Mix'}
                    >
                      {isCurrentPlaying ? (
                        <Pause size={18} fill="white" />
                      ) : (
                        <Play size={18} fill="white" />
                      )}
                    </button>
                  </td>

                  {/* Column 7: Actions (Playlist & Download) */}
                  <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
                      {/* Add to Playlist button */}
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        style={{ padding: '5px 9px', fontSize: '0.76rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        onClick={() => {
                          if (playlists.length === 0) {
                            onOpenCreatePlaylist(mix.id);
                          } else {
                            setPlaylistDropdownMixId(playlistDropdownMixId === mix.id ? null : mix.id);
                          }
                        }}
                        title="Add to custom playlist"
                      >
                        <Plus size={13} />
                        <span>Playlist</span>
                      </button>

                      {/* Dropdown Menu for Playlist Selection */}
                      {playlistDropdownMixId === mix.id && (
                        <div
                          className="luxury-dropdown-menu"
                          style={{
                            top: 'calc(100% + 6px)',
                            right: 0,
                            minWidth: '210px',
                            zIndex: 100
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

                      {/* Download Mix Button (Admin only) */}
                      {currentUser?.role === 'admin' && mix.isDownloadable && (
                        <a
                          href={mix.audioUrl}
                          download={`${mix.title} - ${mix.artist}.mp3`}
                          className="btn btn-outline btn-sm"
                          style={{ padding: '5px 8px', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.4)' }}
                          title="Download audio mix"
                        >
                          <Download size={13} />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};
