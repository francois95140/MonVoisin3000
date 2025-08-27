import React, { useEffect } from 'react';
import IonIcon from './IonIcon';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className = "",
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl'
  };

  useEffect(() => {
    const modal = document.getElementById('modal');
    if (modal) {
      if (isOpen) {
        modal.classList.add('show');
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
      } else {
        modal.classList.remove('show');
        // Restore body scroll when modal is closed
        document.body.style.overflow = 'unset';
      }
    }

    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle click outside modal to close
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      id="modal"
      className={`modal flex-col ${className}`}
      onClick={handleBackdropClick}
    >
      <div className={`modal-content m-auto mt-4 mb-8 ${sizeClasses[size]} w-full mx-4`}>
        <div className="p-6">
          {/* Header de la modal */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            <button 
              className="text-white/70 hover:text-white text-2xl transition-colors"
              onClick={onClose}
              type="button"
            >
              <IonIcon name="close" />
            </button>
          </div>

          {/* Contenu de la modal */}
          {children}
        </div>
      </div>
      <div className="navheight"></div>
    </div>
  );
};

export default Modal;