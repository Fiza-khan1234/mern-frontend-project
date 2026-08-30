import React, { useState } from 'react';
import { Star } from 'lucide-react';

const RATING_LABELS = {
  1: 'Poor Support Experience',
  2: 'Fair Resolution',
  3: 'Good Service',
  4: 'Very Good & Prompt',
  5: 'Exceptional & Outstanding!',
};

export const StarRating = ({
  rating = 0,
  onChange = null,
  readonly = false,
  size = 22,
  showLabel = true,
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const activeRating = hoverRating || rating;

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= activeRating;

          if (readonly || !onChange) {
            return (
              <Star
                key={star}
                size={size}
                fill={isFilled ? '#f59e0b' : 'none'}
                color={isFilled ? '#f59e0b' : 'var(--border)'}
                style={{ transition: 'all 0.15s ease' }}
              />
            );
          }

          return (
            <button
              type="button"
              key={star}
              onClick={() => onChange(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '3px',
                borderRadius: 'var(--radius-xs)',
                display: 'inline-flex',
                transition: 'transform 0.15s ease',
                transform: hoverRating === star ? 'scale(1.25)' : 'scale(1)',
              }}
              title={`${star} Star${star > 1 ? 's' : ''}`}
            >
              <Star
                size={size}
                fill={isFilled ? '#f59e0b' : 'none'}
                color={isFilled ? '#f59e0b' : 'var(--text-muted)'}
              />
            </button>
          );
        })}
      </div>

      {!readonly && showLabel && activeRating > 0 && (
        <span
          style={{
            fontSize: '0.8rem',
            fontWeight: 700,
            color: activeRating >= 4 ? 'var(--success)' : activeRating === 3 ? 'var(--info)' : 'var(--warning)',
            animation: 'fade-in 0.2s ease',
          }}
        >
          {RATING_LABELS[activeRating]}
        </span>
      )}
    </div>
  );
};
