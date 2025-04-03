import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';

function CommentModal({ isOpen, onClose, onSubmit, messageContent, initialComment = '' }) {
  const [comment, setComment] = useState(initialComment);
  const { t } = useTranslation();

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(comment);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{t('addComment')}</h3>
          <button className="modal-close" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div className="modal-body">
          <div className="message-preview">
            {messageContent}
          </div>
          <form onSubmit={handleSubmit}>
            <textarea
              className="comment-input"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t('writeComment')}
              rows={4}
            />
            <div className="modal-actions">
              <button type="button" className="cancel-button" onClick={onClose}>
                {t('cancel')}
              </button>
              <button type="submit" className="submit-button" disabled={!comment.trim()}>
                {t('submit')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CommentModal; 