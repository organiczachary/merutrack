import React, { useState } from 'react';
import { MobileNavigation } from '@/components/navigation/MobileNavigation';
import { PhotoGallery } from '@/components/photos/PhotoGallery';
import { PhotoUpload } from '@/components/photos/PhotoUpload';
import { PhotoFilters } from '@/components/photos/PhotoFilters';
import { Camera, Upload, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePhotoStats } from '@/hooks/usePhotoStats';

const PhotoManagement = () => {
  const { data: stats } = usePhotoStats();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      <MobileNavigation />
      <main className="lg:ml-64">
        <div className="p-4 space-y-6">
          {/* Header */}
          <div className="backdrop-blur-md bg-white/40 border border-white/20 rounded-2xl shadow-xl p-6 animate-fade-in">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <Camera className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-800 mb-1">
                    Photo Management
                  </h1>
                  <p className="text-slate-600">
                    Upload, organize, and manage training session photos and documentation.
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setIsUploadOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Photos
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="backdrop-blur-sm bg-white/60 border-white/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Camera className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Photos</p>
                    <p className="text-2xl font-bold text-foreground">{stats?.totalPhotos || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="backdrop-blur-sm bg-white/60 border-white/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <Search className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Sessions with Photos</p>
                    <p className="text-2xl font-bold text-foreground">{stats?.sessionsWithPhotos || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="backdrop-blur-sm bg-white/60 border-white/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Upload className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Recent Uploads</p>
                    <p className="text-2xl font-bold text-foreground">{stats?.recentUploads || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Card className="backdrop-blur-sm bg-white/60 border-white/30">
            <CardHeader>
              <CardTitle>Training Session Photos</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="gallery" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="gallery">Photo Gallery</TabsTrigger>
                  <TabsTrigger value="upload">Upload Photos</TabsTrigger>
                </TabsList>
                
                <TabsContent value="gallery" className="mt-6 space-y-4">
                  <PhotoFilters 
                    onSessionChange={setSelectedSessionId}
                    onSearchChange={setSearchQuery}
                  />
                  <PhotoGallery 
                    sessionId={selectedSessionId}
                    searchQuery={searchQuery}
                  />
                </TabsContent>
                
                <TabsContent value="upload" className="mt-6">
                  <PhotoUpload />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Upload Modal */}
        {isUploadOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-800">Upload Photos</h2>
                  <Button
                    variant="outline"
                    onClick={() => setIsUploadOpen(false)}
                  >
                    Close
                  </Button>
                </div>
                <PhotoUpload onComplete={() => setIsUploadOpen(false)} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PhotoManagement;