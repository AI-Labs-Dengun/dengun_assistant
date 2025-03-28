import React, { useState, useEffect } from 'react';

function CommentModal({ isOpen, onClose, onSubmit, messageContent, initialComment }) {
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (initialComment) {
      setComment(initialComment);
    }
  }, [initialComment]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (comment.trim()) {
      onSubmit(comment);
      onClose();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Add Comment</h3>
          <button onClick={onClose} className="modal-close">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div className="modal-body">
          <div className="message-preview">
            <p>{messageContent}</p>
          </div>
          <form onSubmit={handleSubmit}>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write your comment..."
              className="comment-input"
              rows="4"
            />
            <div className="modal-actions">
              <button type="button" onClick={onClose} className="cancel-button">
                Cancel
              </button>
              <button type="submit" className="submit-button" disabled={!comment.trim()}>
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CommentModal; 