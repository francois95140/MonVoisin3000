import React from 'react';
import { useWebSocket } from '../../contexts/WebSocketContext';

interface WebSocketStatusProps {
  className?: string;
}

const WebSocketStatus: React.FC<WebSocketStatusProps> = ({ className = "" }) => {
  const { isConnected } = useWebSocket();

  if (!isConnected) {
    return (
      <div className={`w-4 h-4 bg-orange-500 rounded-full border-2 border-white shadow-lg animate-pulse ${className}`}>
      </div>
    );
  }

  return (
    <div className={`w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg ${className}`}>
    </div>
  );
};

export default WebSocketStatus;