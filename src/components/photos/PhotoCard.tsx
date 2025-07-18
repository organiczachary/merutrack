import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  MapPin, 
  User, 
  Download, 
  FileText, 
  Image as ImageIcon,
  FileType
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

interface PhotoCardProps {
  photo: Photo;
  onClick: () => void;
  isDocument?: boolean;
}

export const PhotoCard: React.FC<PhotoCardProps> = ({ photo, onClick, isDocument = false }) => {
  const isImage = photo.mime_type?.startsWith('image/');
  
  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
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

  const getFileExtension = () => {
    return photo.file_name.split('.').pop()?.toUpperCase() || 'FILE';
  };

  return (
    <Card 
      className="backdrop-blur-sm bg-white/60 border-white/30 hover:bg-white/70 transition-all duration-300 cursor-pointer group"
      onClick={onClick}
    >
      <CardContent className="p-4 space-y-3">
        {/* Image/Document Preview */}
        <div className="relative">
          {isImage ? (
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={getImageUrl() || ''}
                alt={photo.caption || photo.file_name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="aspect-video bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex flex-col items-center justify-center">
              <FileText className="w-12 h-12 text-blue-600 mb-2" />
              <Badge variant="outline" className="text-xs">
                {getFileExtension()}
              </Badge>
            </div>
          )}
          
          {/* Download Button */}
          <Button
            variant="outline"
            size="sm"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm"
            onClick={handleDownload}
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>

        {/* File Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {isImage ? (
              <ImageIcon className="w-4 h-4 text-blue-600" />
            ) : (
              <FileType className="w-4 h-4 text-green-600" />
            )}
            <h4 className="font-medium text-slate-800 text-sm truncate">
              {photo.file_name}
            </h4>
          </div>
          
          {photo.caption && (
            <p className="text-xs text-slate-600 line-clamp-2">
              {photo.caption}
            </p>
          )}
          
          <div className="text-xs text-slate-500 space-y-1">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{new Date(photo.training_sessions.scheduled_date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{photo.training_sessions.venue}</span>
            </div>
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span className="truncate">{photo.profiles.full_name}</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <Badge variant="secondary" className="text-xs">
              {photo.training_sessions.title}
            </Badge>
            <span className="text-xs text-slate-500">
              {formatFileSize(photo.file_size)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};