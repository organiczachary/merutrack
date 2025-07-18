import React from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Download, 
  Calendar, 
  MapPin, 
  User, 
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type Photo = Tables<'photos'> & {
  profiles: {
    full_name: string;
  };
  training_sessions: {
    title: string;
    venue: string;
    scheduled_date: string;
  };
};

interface PhotoViewerProps {
  photo: Photo;
  isOpen: boolean;
  onClose: () => void;
}

export const PhotoViewer: React.FC<PhotoViewerProps> = ({ photo, isOpen, onClose }) => {
  const isImage = photo.mime_type?.startsWith('image/');

  const handleDownload = async () => {
    try {
      const bucket = isImage ? 'training-photos' : 'training-documents';
      const { data, error } = await supabase.storage
        .from(bucket)
        .download(photo.file_path);
      
      if (error) throw error;
      
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = photo.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const getImageUrl = () => {
    if (!isImage) return null;
    const { data } = supabase.storage
      .from('training-photos')
      .getPublicUrl(photo.file_path);
    return data.publicUrl;
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown size';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <div className="relative">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 bg-black/50 backdrop-blur-sm text-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isImage ? (
                  <ImageIcon className="w-5 h-5" />
                ) : (
                  <FileText className="w-5 h-5" />
                )}
                <h2 className="font-semibold truncate">{photo.file_name}</h2>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="min-h-[60vh]">
            {isImage ? (
              <img
                src={getImageUrl() || ''}
                alt={photo.caption || photo.file_name}
                className="w-full h-auto max-h-[70vh] object-contain bg-black"
              />
            ) : (
              <div className="flex items-center justify-center h-[60vh] bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="text-center">
                  <FileText className="w-24 h-24 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">
                    {photo.file_name}
                  </h3>
                  <p className="text-slate-600 mb-4">
                    {formatFileSize(photo.file_size)}
                  </p>
                  <Button onClick={handleDownload} className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Download className="w-4 h-4 mr-2" />
                    Download File
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Footer with Details */}
          <div className="bg-white border-t p-4 space-y-4">
            {/* Caption */}
            {photo.caption && (
              <div>
                <h4 className="font-semibold text-slate-800 mb-1">Caption</h4>
                <p className="text-slate-600">{photo.caption}</p>
              </div>
            )}

            {/* Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-800">Training Session</h4>
                <div className="space-y-1 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(photo.training_sessions.scheduled_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{photo.training_sessions.venue}</span>
                  </div>
                  <Badge variant="secondary" className="mt-2">
                    {photo.training_sessions.title}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-slate-800">File Information</h4>
                <div className="space-y-1 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>Uploaded by {photo.profiles.full_name}</span>
                  </div>
                  <div>
                    <span>Size: {formatFileSize(photo.file_size)}</span>
                  </div>
                  <div>
                    <span>Type: {photo.mime_type}</span>
                  </div>
                  <div>
                    <span>Uploaded: {new Date(photo.created_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};