import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { CloudUpload, X } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const uploadSchema = z.object({
  title: z.string().min(1, "Meeting title is required"),
  date: z.string().min(1, "Date and time is required"),
  meetingType: z.string().optional(),
  participants: z.string().optional(),
  autoAnalysis: z.boolean().default(true),
});

type UploadForm = z.infer<typeof uploadSchema>;

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const { toast } = useToast();

  const form = useForm<UploadForm>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      title: "",
      date: "",
      meetingType: "Team Meeting",
      participants: "",
      autoAnalysis: true,
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: UploadForm & { file: File }) => {
      const formData = new FormData();
      formData.append("audio", data.file);
      formData.append("title", data.title);
      formData.append("date", data.date);
      formData.append("meetingType", data.meetingType || "");
      formData.append("participants", JSON.stringify(
        data.participants ? data.participants.split(",").map(p => p.trim()) : []
      ));
      formData.append("autoAnalysis", data.autoAnalysis.toString());

      // Simulate upload progress
      const xhr = new XMLHttpRequest();
      
      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            setUploadProgress(Math.round(progress));
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(`Upload failed: ${xhr.statusText}`));
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("Upload failed"));
        });

        xhr.open("POST", "/api/meetings");
        xhr.send(formData);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meetings"] });
      toast({
        title: "Upload successful",
        description: "Your meeting is being processed. Transcription will be available shortly.",
      });
      handleClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload meeting. Please try again.",
        variant: "destructive",
      });
      setUploadProgress(0);
    },
  });

  const handleFileSelect = (file: File) => {
    const maxSize = 500 * 1024 * 1024; // 500MB
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/m4a'];
    
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 500MB.",
        variant: "destructive",
      });
      return;
    }

    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|m4a)$/i)) {
      toast({
        title: "Invalid file type",
        description: "Please select an MP3, WAV, or M4A file.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleSubmit = (data: UploadForm) => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select an audio file to upload.",
        variant: "destructive",
      });
      return;
    }

    uploadMutation.mutate({ ...data, file: selectedFile });
  };

  const handleClose = () => {
    form.reset();
    setSelectedFile(null);
    setUploadProgress(0);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Meeting Recording</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="title">Meeting Title</Label>
            <Input
              id="title"
              placeholder="e.g., Weekly Team Standup"
              {...form.register("title")}
            />
            {form.formState.errors.title && (
              <p className="text-sm text-red-600 mt-1">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="date">Date & Time</Label>
            <Input
              id="date"
              type="datetime-local"
              {...form.register("date")}
            />
            {form.formState.errors.date && (
              <p className="text-sm text-red-600 mt-1">{form.formState.errors.date.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="audio">Audio File</Label>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                isDragOver 
                  ? "border-blue-400 bg-blue-50" 
                  : selectedFile 
                    ? "border-green-400 bg-green-50" 
                    : "border-slate-300 hover:border-blue-400"
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => document.getElementById("file-input")?.click()}
            >
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CloudUpload className="text-blue-600 text-2xl" />
              </div>
              {selectedFile ? (
                <div>
                  <p className="text-slate-900 font-medium mb-2">{selectedFile.name}</p>
                  <p className="text-slate-500 text-sm">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                    }}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Remove
                  </Button>
                </div>
              ) : (
                <div>
                  <p className="text-slate-900 font-medium mb-2">Drop your audio file here or click to browse</p>
                  <p className="text-slate-500 text-sm mb-4">Supports MP3, WAV, M4A files up to 500MB</p>
                </div>
              )}
              
              <input
                id="file-input"
                type="file"
                className="hidden"
                accept=".mp3,.wav,.m4a"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
              />
            </div>

            {uploadProgress > 0 && (
              <div className="mt-4">
                <div className="flex justify-between text-sm text-slate-600 mb-2">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="meetingType">Meeting Type</Label>
            <Select
              value={form.watch("meetingType")}
              onValueChange={(value) => form.setValue("meetingType", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Team Meeting">Team Meeting</SelectItem>
                <SelectItem value="Client Call">Client Call</SelectItem>
                <SelectItem value="Project Review">Project Review</SelectItem>
                <SelectItem value="Training Session">Training Session</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="participants">Participants (Optional)</Label>
            <Input
              id="participants"
              placeholder="Enter participant names separated by commas"
              {...form.register("participants")}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="autoAnalysis"
              checked={form.watch("autoAnalysis")}
              onCheckedChange={(checked) => form.setValue("autoAnalysis", !!checked)}
            />
            <Label htmlFor="autoAnalysis" className="text-sm">
              Automatically extract action items and key topics
            </Label>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={uploadMutation.isPending || !selectedFile}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {uploadMutation.isPending ? "Uploading..." : "Upload & Process"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
