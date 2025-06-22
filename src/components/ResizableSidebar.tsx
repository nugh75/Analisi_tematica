import React, { useState, useCallback, useRef } from 'react';
import { Box, Paper } from '@mui/material';

interface ResizableSidebarProps {
  children: React.ReactNode;
  width: number;
  onWidthChange: (width: number) => void;
  minWidth?: number;
  maxWidth?: number;
  collapsed: boolean;
}

export const ResizableSidebar: React.FC<ResizableSidebarProps> = ({
  children,
  width,
  onWidthChange,
  minWidth = 200,
  maxWidth = 500,
  collapsed
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !sidebarRef.current) return;

    const rect = sidebarRef.current.getBoundingClientRect();
    const newWidth = e.clientX - rect.left;
    
    if (newWidth >= minWidth && newWidth <= maxWidth) {
      onWidthChange(newWidth);
    }
  }, [isDragging, minWidth, maxWidth, onWidthChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  if (collapsed) {
    return null;
  }

  return (
    <Box
      ref={sidebarRef}
      sx={{
        width: `${width}px`,
        height: '100%',
        position: 'relative',
        flexShrink: 0,
        borderRight: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        transition: 'width 0.2s ease',
      }}
    >
      {children}
      
      {/* Resize Handle */}
      <Box
        onMouseDown={handleMouseDown}
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 4,
          height: '100%',
          cursor: 'col-resize',
          bgcolor: 'transparent',
          '&:hover': {
            bgcolor: 'primary.main',
            opacity: 0.3,
          },
          '&:active': {
            bgcolor: 'primary.main',
            opacity: 0.5,
          },
          transition: 'all 0.2s ease',
        }}
      />
    </Box>
  );
};

export default ResizableSidebar;
