import React from 'react';
import { Loader2, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

// Basic loading spinner
export function LoadingSpinner({ 
  className,
  size = "default" 
}: { 
  className?: string;
  size?: "sm" | "default" | "lg";
}) {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-6 w-6", 
    lg: "h-8 w-8"
  };

  return (
    <Loader2 className={cn("animate-spin", sizeClasses[size], className)} />
  );
}

// Loading spinner with text
export function LoadingWithText({ 
  text = "Loading...", 
  className,
  size = "default"
}: { 
  text?: string;
  className?: string;
  size?: "sm" | "default" | "lg";
}) {
  return (
    <div className={cn("flex items-center justify-center space-x-2", className)}>
      <LoadingSpinner size={size} />
      <span className="text-muted-foreground">{text}</span>
    </div>
  );
}

// Full page loading
export function PageLoading({ 
  message = "Loading page..." 
}: { 
  message?: string; 
}) {
  return (
    <div className="min-h-screen flex items-center justify-center auth-background">
      <div className="glass-card rounded-lg p-8 text-center space-y-4">
        <LoadingSpinner size="lg" className="mx-auto text-primary" />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

// Button loading state
export function LoadingButton({ 
  children, 
  loading = false,
  loadingText = "Loading...",
  variant = "default",
  size = "default",
  className,
  ...props 
}: {
  children: React.ReactNode;
  loading?: boolean;
  loadingText?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Button
      variant={variant}
      size={size}
      disabled={loading || props.disabled}
      className={className}
      {...props}
    >
      {loading ? (
        <>
          <LoadingSpinner size="sm" className="mr-2" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </Button>
  );
}

// Card loading state
export function LoadingCard({ 
  className,
  height = "h-32"
}: { 
  className?: string;
  height?: string;
}) {
  return (
    <div className={cn("glass-card rounded-lg p-6", height, className)}>
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-muted rounded w-3/4"></div>
        <div className="h-4 bg-muted rounded w-1/2"></div>
        <div className="h-4 bg-muted rounded w-5/6"></div>
      </div>
    </div>
  );
}

// List loading state
export function LoadingList({ 
  items = 5,
  className 
}: { 
  items?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="glass-card rounded-lg p-4">
          <div className="animate-pulse flex items-center space-x-4">
            <div className="rounded-full bg-muted h-10 w-10"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Progress bar
export function ProgressBar({ 
  progress,
  className,
  showText = true
}: { 
  progress: number;
  className?: string;
  showText?: boolean;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {showText && (
        <div className="flex justify-between text-sm">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
      )}
      <div className="w-full bg-muted rounded-full h-2">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
}

// Upload progress
export function UploadProgress({ 
  files,
  className 
}: { 
  files: Array<{ name: string; progress: number; status: 'uploading' | 'complete' | 'error' }>;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {files.map((file, index) => (
        <div key={index} className="glass-card rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium truncate">{file.name}</span>
            <div className="flex items-center space-x-2">
              {file.status === 'uploading' && <LoadingSpinner size="sm" />}
              {file.status === 'complete' && <span className="text-primary text-sm">✓</span>}
              {file.status === 'error' && <span className="text-destructive text-sm">✗</span>}
            </div>
          </div>
          <ProgressBar progress={file.progress} showText={false} />
        </div>
      ))}
    </div>
  );
}

// Connection status indicator
export function ConnectionStatus({ 
  isOnline = true,
  className 
}: { 
  isOnline?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center space-x-2 text-sm", className)}>
      {isOnline ? (
        <>
          <Wifi className="h-4 w-4 text-primary" />
          <span className="text-muted-foreground">Online</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 text-destructive" />
          <span className="text-destructive">Offline</span>
        </>
      )}
    </div>
  );
}

// Sync status
export function SyncStatus({ 
  status = 'synced',
  lastSync,
  onSync,
  className 
}: { 
  status?: 'syncing' | 'synced' | 'error' | 'pending';
  lastSync?: Date;
  onSync?: () => void;
  className?: string;
}) {
  const statusConfig = {
    syncing: { text: 'Syncing...', color: 'text-primary' },
    synced: { text: 'Synced', color: 'text-primary' },
    error: { text: 'Sync failed', color: 'text-destructive' },
    pending: { text: 'Pending sync', color: 'text-muted-foreground' },
  };

  const config = statusConfig[status];

  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div className="flex items-center space-x-2 text-sm">
        {status === 'syncing' && <LoadingSpinner size="sm" />}
        <span className={config.color}>{config.text}</span>
        {lastSync && status === 'synced' && (
          <span className="text-xs text-muted-foreground">
            • {lastSync.toLocaleTimeString()}
          </span>
        )}
      </div>
      
      {onSync && status !== 'syncing' && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onSync}
          className="h-6 px-2"
        >
          Sync now
        </Button>
      )}
    </div>
  );
}

// Empty state component
export function EmptyState({ 
  icon,
  title,
  description,
  action,
  className 
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("text-center py-12 px-6", className)}>
      {icon && (
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-muted p-3">
            {icon}
          </div>
        </div>
      )}
      <h3 className="text-lg font-medium text-foreground mb-2">{title}</h3>
      {description && (
        <p className="text-muted-foreground mb-6 max-w-sm mx-auto">{description}</p>
      )}
      {action}
    </div>
  );
}