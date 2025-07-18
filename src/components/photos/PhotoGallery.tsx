import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PhotoCard } from './PhotoCard';
import { PhotoViewer } from './PhotoViewer';
import { Card, CardContent } from '@/components/ui/card';
import { Image as ImageIcon, FileText } from 'lucide-react';
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

interface PhotoGalleryProps {
  sessionId?: string | null;
  searchQuery?: string;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ sessionId, searchQuery }) => {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);

  const { data: photos, isLoading } = useQuery({
    queryKey: ['photos', sessionId, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('photos')
        .select(`
          *,
          profiles!inner(full_name),
          training_sessions!inner(title, venue, scheduled_date)
        `)
        .order('created_at', { ascending: false });

      if (sessionId) {
        query = query.eq('training_session_id', sessionId);
      }

      if (searchQuery) {
        query = query.or(`caption.ilike.%${searchQuery}%,file_name.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Photo[];
    }
  });

  const openViewer = (photo: Photo) => {
    setSelectedPhoto(photo);
    setViewerOpen(true);
  };

  const closeViewer = () => {
    setViewerOpen(false);
    setSelectedPhoto(null);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="backdrop-blur-sm bg-white/60 border-white/30">
            <CardContent className="p-4">
              <div className="animate-pulse space-y-3">
                <div className="bg-gray-200 rounded-lg h-48"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!photos || photos.length === 0) {
    return (
      <Card className="backdrop-blur-sm bg-white/60 border-white/30">
        <CardContent className="p-8 text-center">
          {sessionId || searchQuery ? (
            <>
              <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No photos found</h3>
              <p className="text-gray-600">
                {sessionId 
                  ? "No photos have been uploaded for this training session yet."
                  : "No photos match your search criteria."
                }
              </p>
            </>
          ) : (
            <>
              <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No photos uploaded</h3>
              <p className="text-gray-600">
                Start by uploading photos from your training sessions.
              </p>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  const imagePhotos = photos.filter(photo => photo.mime_type?.startsWith('image/'));
  const documentPhotos = photos.filter(photo => !photo.mime_type?.startsWith('image/'));

  return (
    <div className="space-y-6">
      {/* Images Section */}
      {imagePhotos.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <ImageIcon className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-slate-800">
              Photos ({imagePhotos.length})
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {imagePhotos.map((photo) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                onClick={() => openViewer(photo)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Documents Section */}
      {documentPhotos.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-slate-800">
              Documents ({documentPhotos.length})
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documentPhotos.map((photo) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                onClick={() => openViewer(photo)}
                isDocument
              />
            ))}
          </div>
        </div>
      )}

      {/* Photo Viewer */}
      {selectedPhoto && (
        <PhotoViewer
          photo={selectedPhoto}
          isOpen={viewerOpen}
          onClose={closeViewer}
        />
      )}
    </div>
  );
};