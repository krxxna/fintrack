import React, { useState } from 'react';
import { X, UserPlus, Image } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=96&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=96&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=96&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=96&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=96&q=80',
];

export function AddRecipientModal({ isOpen, onClose, onAdd }) {
  const toast = useToast();
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(DEFAULT_AVATARS[2]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast('Please enter a recipient name', 'error');
      return;
    }
    onAdd({
      name: name.trim(),
      image: selectedAvatar,
    });
    toast(`Recipient ${name} added successfully`, 'success');
    setName('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <UserPlus size={18} style={{ color: 'var(--teal)' }} /> Add New Recipient
          </div>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Recipient Name *</label>
              <input
                className="form-input"
                placeholder="e.g. Sarah Connor"
                value={name}
                onChange={e => setName(e.target.value)}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Select Avatar Profile</label>
              <div style={{ display: 'flex', gap: 10, marginTop: 8, overflowX: 'auto', paddingBottom: 4 }}>
                {DEFAULT_AVATARS.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt="avatar"
                    onClick={() => setSelectedAvatar(img)}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      cursor: 'pointer',
                      border: selectedAvatar === img ? '3px solid var(--teal)' : '2px solid transparent',
                      transform: selectedAvatar === img ? 'scale(1.1)' : 'scale(1)',
                      transition: 'all 0.2s',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Add Recipient</button>
          </div>
        </form>
      </div>
    </div>
  );
}
