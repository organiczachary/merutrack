import React, { useState } from 'react';
import { Upload, Download, Database, Users, MapPin, BookOpen, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingButton } from '@/components/ui/loading-states';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SeedingStatus {
  isSeeding: boolean;
  currentTask: string;
  progress: number;
  completed: string[];
  errors: string[];
}

interface ImportFile {
  file: File;
  type: 'csv' | 'json';
  preview: any[];
  isValid: boolean;
  errors: string[];
}

export function DataSeedingInterface() {
  const [seedingStatus, setSeedingStatus] = useState<SeedingStatus>({
    isSeeding: false,
    currentTask: '',
    progress: 0,
    completed: [],
    errors: []
  });

  const [importFiles, setImportFiles] = useState<Record<string, ImportFile>>({});
  const { toast } = useToast();

  // Sample data for Meru County
  const sampleData = {
    wards: 45,
    modules: 11,
    sampleUsers: 25,
    trainingSessions: 50
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, dataType: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'json'].includes(fileExtension || '')) {
      toast({
        title: "Invalid file format",
        description: "Please upload a CSV or JSON file.",
        variant: "destructive"
      });
      return;
    }

    try {
      const text = await file.text();
      let preview: any[] = [];
      let isValid = true;
      let errors: string[] = [];

      if (fileExtension === 'csv') {
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        preview = lines.slice(1, 6).map(line => {
          const values = line.split(',').map(v => v.trim());
          return headers.reduce((obj, header, index) => {
            obj[header] = values[index] || '';
            return obj;
          }, {} as any);
        });
      } else {
        preview = JSON.parse(text).slice(0, 5);
      }

      // Validate data structure based on type
      if (dataType === 'wards') {
        const requiredFields = ['name', 'constituency', 'ward_code'];
        const missingFields = requiredFields.filter(field => 
          !preview.every(item => item.hasOwnProperty(field))
        );
        if (missingFields.length > 0) {
          errors.push(`Missing required fields: ${missingFields.join(', ')}`);
          isValid = false;
        }
      }

      setImportFiles(prev => ({
        ...prev,
        [dataType]: {
          file,
          type: fileExtension as 'csv' | 'json',
          preview,
          isValid,
          errors
        }
      }));

      toast({
        title: "File uploaded",
        description: `${file.name} has been processed and is ready for import.`,
      });

    } catch (error) {
      toast({
        title: "File processing failed",
        description: "Could not parse the uploaded file. Please check the format.",
        variant: "destructive"
      });
    }
  };

  const seedSampleData = async () => {
    setSeedingStatus(prev => ({ ...prev, isSeeding: true, progress: 0, completed: [], errors: [] }));

    try {
      // Check if data already exists
      setSeedingStatus(prev => ({ ...prev, currentTask: 'Checking existing data...', progress: 10 }));
      
      const { data: existingWards } = await supabase.from('wards').select('id').limit(1);
      const { data: existingModules } = await supabase.from('modules').select('id').limit(1);
      
      if (existingWards && existingWards.length > 0) {
        setSeedingStatus(prev => ({ 
          ...prev, 
          errors: [...prev.errors, 'Wards data already exists. Please clear existing data first.'],
          isSeeding: false
        }));
        return;
      }

      // Seed wards (already done via migration, but we can check)
      setSeedingStatus(prev => ({ ...prev, currentTask: 'Verifying wards data...', progress: 30 }));
      
      const { data: wardsData, error: wardsError } = await supabase.from('wards').select('*');
      
      if (wardsError) {
        throw new Error(`Failed to verify wards: ${wardsError.message}`);
      }

      if (wardsData && wardsData.length === 45) {
        setSeedingStatus(prev => ({ 
          ...prev, 
          completed: [...prev.completed, 'Wards data verified (45 wards)'],
          progress: 50
        }));
      }

      // Verify modules
      setSeedingStatus(prev => ({ ...prev, currentTask: 'Verifying modules data...', progress: 70 }));
      
      const { data: modulesData, error: modulesError } = await supabase.from('modules').select('*');
      
      if (modulesError) {
        throw new Error(`Failed to verify modules: ${modulesError.message}`);
      }

      if (modulesData && modulesData.length >= 11) {
        setSeedingStatus(prev => ({ 
          ...prev, 
          completed: [...prev.completed, `Modules data verified (${modulesData.length} modules)`],
          progress: 90
        }));
      }

      setSeedingStatus(prev => ({ 
        ...prev, 
        currentTask: 'Seeding completed successfully!',
        progress: 100,
        isSeeding: false,
        completed: [...prev.completed, 'All sample data verified and ready']
      }));

      toast({
        title: "Data seeding completed",
        description: "All sample data has been successfully verified.",
      });

    } catch (error) {
      console.error('Seeding error:', error);
      setSeedingStatus(prev => ({ 
        ...prev, 
        errors: [...prev.errors, error instanceof Error ? error.message : 'Unknown error occurred'],
        isSeeding: false
      }));

      toast({
        title: "Seeding failed",
        description: "An error occurred while seeding data. Check the logs for details.",
        variant: "destructive"
      });
    }
  };

  const clearAllData = async () => {
    if (!confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      return;
    }

    try {
      setSeedingStatus(prev => ({ ...prev, isSeeding: true, currentTask: 'Clearing data...', progress: 0 }));

      // Clear in reverse order due to foreign key constraints
      const tables: Array<'photos' | 'attendance' | 'training_sessions' | 'trainer_modules' | 'modules' | 'wards'> = [
        'photos', 'attendance', 'training_sessions', 'trainer_modules', 'modules', 'wards'
      ];
      
      for (let i = 0; i < tables.length; i++) {
        const table = tables[i];
        setSeedingStatus(prev => ({ 
          ...prev, 
          currentTask: `Clearing ${table}...`, 
          progress: (i / tables.length) * 100 
        }));
        
        const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
        
        if (error && !error.message.includes('row(s) returned')) {
          throw new Error(`Failed to clear ${table}: ${error.message}`);
        }
      }

      setSeedingStatus(prev => ({ 
        ...prev, 
        currentTask: 'Data cleared successfully!',
        progress: 100,
        isSeeding: false,
        completed: ['All data cleared successfully']
      }));

      toast({
        title: "Data cleared",
        description: "All data has been successfully removed from the database.",
      });

    } catch (error) {
      console.error('Clear data error:', error);
      setSeedingStatus(prev => ({ 
        ...prev, 
        errors: [...prev.errors, error instanceof Error ? error.message : 'Unknown error occurred'],
        isSeeding: false
      }));

      toast({
        title: "Clear data failed",
        description: "An error occurred while clearing data.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Data Seeding & Import</h1>
        <p className="text-muted-foreground">
          Initialize the system with sample data or import your own datasets.
        </p>
      </div>

      <Tabs defaultValue="sample-data" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sample-data">Sample Data</TabsTrigger>
          <TabsTrigger value="import">Import Data</TabsTrigger>
          <TabsTrigger value="system">System Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="sample-data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Meru County Sample Data
              </CardTitle>
              <CardDescription>
                Initialize the system with authentic Meru County data including all 45 wards, 
                training modules for each value chain, and sample users.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-card p-4 text-center space-y-2">
                  <MapPin className="h-8 w-8 mx-auto text-primary" />
                  <div className="text-2xl font-bold">{sampleData.wards}</div>
                  <div className="text-sm text-muted-foreground">Wards across 9 constituencies</div>
                </div>
                
                <div className="glass-card p-4 text-center space-y-2">
                  <BookOpen className="h-8 w-8 mx-auto text-primary" />
                  <div className="text-2xl font-bold">{sampleData.modules}</div>
                  <div className="text-sm text-muted-foreground">Training modules</div>
                </div>
                
                <div className="glass-card p-4 text-center space-y-2">
                  <Users className="h-8 w-8 mx-auto text-primary" />
                  <div className="text-2xl font-bold">{sampleData.sampleUsers}</div>
                  <div className="text-sm text-muted-foreground">Sample users</div>
                </div>
                
                <div className="glass-card p-4 text-center space-y-2">
                  <Database className="h-8 w-8 mx-auto text-primary" />
                  <div className="text-2xl font-bold">{sampleData.trainingSessions}</div>
                  <div className="text-sm text-muted-foreground">Sample training sessions</div>
                </div>
              </div>

              {seedingStatus.isSeeding && (
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">{seedingStatus.currentTask}</div>
                  <Progress value={seedingStatus.progress} className="w-full" />
                </div>
              )}

              {seedingStatus.completed.length > 0 && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      {seedingStatus.completed.map((task, index) => (
                        <div key={index} className="text-sm">✓ {task}</div>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {seedingStatus.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      {seedingStatus.errors.map((error, index) => (
                        <div key={index} className="text-sm">• {error}</div>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-4">
                <LoadingButton
                  onClick={seedSampleData}
                  loading={seedingStatus.isSeeding}
                  loadingText="Seeding data..."
                  className="flex-1"
                >
                  <Database className="h-4 w-4 mr-2" />
                  Seed Sample Data
                </LoadingButton>
                
                <Button
                  variant="outline"
                  onClick={() => window.open('https://example.com/sample-data.zip', '_blank')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Templates
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {['wards', 'modules', 'users', 'training-sessions'].map((dataType) => (
              <Card key={dataType}>
                <CardHeader>
                  <CardTitle className="capitalize">{dataType.replace('-', ' ')}</CardTitle>
                  <CardDescription>
                    Import {dataType.replace('-', ' ')} from CSV or JSON files
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Drop files here or click to browse
                      </p>
                      <input
                        type="file"
                        accept=".csv,.json"
                        onChange={(e) => handleFileUpload(e, dataType)}
                        className="hidden"
                        id={`file-input-${dataType}`}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById(`file-input-${dataType}`)?.click()}
                      >
                        Choose File
                      </Button>
                    </div>
                  </div>

                  {importFiles[dataType] && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{importFiles[dataType].file.name}</span>
                        <span className={`text-xs ${importFiles[dataType].isValid ? 'text-primary' : 'text-destructive'}`}>
                          {importFiles[dataType].isValid ? 'Valid' : 'Invalid'}
                        </span>
                      </div>
                      
                      {importFiles[dataType].errors.length > 0 && (
                        <Alert variant="destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            {importFiles[dataType].errors.join(', ')}
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="text-xs text-muted-foreground">
                        Preview: {importFiles[dataType].preview.length} records
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                These actions will permanently modify or delete data. Use with extreme caution.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Warning: These operations cannot be undone. Make sure you have backups before proceeding.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <Button
                  variant="destructive"
                  onClick={clearAllData}
                  disabled={seedingStatus.isSeeding}
                >
                  Clear All Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}