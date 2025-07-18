import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Upload, X, Image as ImageIcon, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface PhotoUploadProps {
  onComplete?: () => void;
  sessionId?: string;
}

interface UploadFile {
  file: File;
  progress: number;
  uploaded: boolean;
  error?: string;
  caption?: string;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({ onComplete, sessionId }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedSessionId, setSelectedSessionId] = useState(sessionId || '');
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [globalCaption, setGlobalCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Get available training sessions for current user
  const { data: sessions } = useQuery({
    queryKey: ['training-sessions-for-upload'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('training_sessions')
        .select('id, title, scheduled_date, venue')
        .order('scheduled_date', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data;
    }
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      progress: 0,
      uploaded: false,
      caption: globalCaption
    }));
    setFiles(prev => [...prev, ...newFiles]);
  }, [globalCaption]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const updateFileCaption = (index: number, caption: string) => {
    setFiles(prev => prev.map((file, i) => 
      i === index ? { ...file, caption } : file
    ));
  };

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!selectedSessionId) {
        throw new Error('Please select a training session');
      }
      if (files.length === 0) {
        throw new Error('Please select files to upload');
      }

      setIsUploading(true);
      const uploadPromises = files.map(async (uploadFile, index) => {
        const { file, caption } = uploadFile;
        
        try {
          // Update progress
          setFiles(prev => prev.map((f, i) => 
            i === index ? { ...f, progress: 10 } : f
          ));

          // Determine bucket based on file type
          const isImage = file.type.startsWith('image/');
          const bucket = isImage ? 'training-photos' : 'training-documents';
          
          // Generate unique filename
          const fileExt = file.name.split('.').pop();
          const fileName = `${selectedSessionId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
          
          // Update progress
          setFiles(prev => prev.map((f, i) => 
            i === index ? { ...f, progress: 30 } : f
          ));

          // Upload to storage
          const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          // Update progress
          setFiles(prev => prev.map((f, i) => 
            i === index ? { ...f, progress: 70 } : f
          ));

          // Save metadata to database
          const { error: dbError } = await supabase
            .from('photos')
            .insert({
              training_session_id: selectedSessionId,
              file_name: file.name,
              file_path: fileName,
              file_size: file.size,
              mime_type: file.type,
              caption: caption || globalCaption || null,
              uploaded_by: user!.id
            });

          if (dbError) throw dbError;

          // Mark as complete
          setFiles(prev => prev.map((f, i) => 
            i === index ? { ...f, progress: 100, uploaded: true } : f
          ));

        } catch (error) {
          console.error('Upload error:', error);
          setFiles(prev => prev.map((f, i) => 
            i === index ? { ...f, error: error instanceof Error ? error.message : 'Upload failed' } : f
          ));
        }
      });

      await Promise.all(uploadPromises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos'] });
      toast({
        title: 'Success',
        description: 'Files uploaded successfully!',
      });
      setFiles([]);
      setGlobalCaption('');
      if (onComplete) onComplete();
    },
    onError: (error) => {
      toast({
        title: 'Upload Error',
        description: error instanceof Error ? error.message : 'Failed to upload files',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setIsUploading(false);
    }
  });

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="w-6 h-6 text-blue-600" />;
    }
    return <FileText className="w-6 h-6 text-green-600" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Session Selection */}
      <div>
        <Label htmlFor="session">Training Session</Label>
        <Select value={selectedSessionId} onValueChange={setSelectedSessionId}>
          <SelectTrigger>
            <SelectValue placeholder="Select a training session" />
          </SelectTrigger>
          <SelectContent>
            {sessions?.map((session) => (
              <SelectItem key={session.id} value={session.id}>
                {session.title} - {new Date(session.scheduled_date).toLocaleDateString()} - {session.venue}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Global Caption */}
      <div>
        <Label htmlFor="globalCaption">Global Caption (optional)</Label>
        <Textarea
          id="globalCaption"
          value={globalCaption}
          onChange={(e) => setGlobalCaption(e.target.value)}
          placeholder="Add a caption that will be applied to all uploaded files"
          rows={2}
        />
      </div>

      {/* File Drop Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        {isDragActive ? (
          <p className="text-lg text-primary font-medium">Drop the files here...</p>
        ) : (
          <div>
            <p className="text-lg text-gray-600 mb-2">
              Drag & drop files here, or click to select files
            </p>
            <p className="text-sm text-gray-500">
              Supports images (JPEG, PNG, GIF, WebP) and documents (PDF, DOC, DOCX) up to 10MB
            </p>
          </div>
        )}
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-slate-800">Files to Upload ({files.length})</h3>
          {files.map((uploadFile, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getFileIcon(uploadFile.file)}
                  <div>
                    <p className="font-medium text-slate-800">{uploadFile.file.name}</p>
                    <p className="text-sm text-slate-600">{formatFileSize(uploadFile.file.size)}</p>
                  </div>
                </div>
                {!isUploading && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeFile(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {/* Individual Caption */}
              <div>
                <Label htmlFor={`caption-${index}`}>Caption (optional)</Label>
                <Input
                  id={`caption-${index}`}
                  value={uploadFile.caption || ''}
                  onChange={(e) => updateFileCaption(index, e.target.value)}
                  placeholder="Add a specific caption for this file"
                  disabled={isUploading}
                />
              </div>

              {/* Progress Bar */}
              {uploadFile.progress > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>
                      {uploadFile.uploaded ? 'Completed' : uploadFile.error ? 'Failed' : 'Uploading...'}
                    </span>
                    <span>{uploadFile.progress}%</span>
                  </div>
                  <Progress 
                    value={uploadFile.progress} 
                    className={uploadFile.error ? 'progress-error' : ''}
                  />
                  {uploadFile.error && (
                    <p className="text-sm text-destructive">{uploadFile.error}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {files.length > 0 && (
        <Button
          onClick={() => uploadMutation.mutate()}
          disabled={!selectedSessionId || isUploading || files.length === 0}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
        >
          {isUploading ? 'Uploading...' : `Upload ${files.length} File${files.length > 1 ? 's' : ''}`}
        </Button>
      )}
    </div>
  );
};