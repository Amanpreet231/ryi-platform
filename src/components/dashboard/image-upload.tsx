'use client';

import * as React from 'react';
import { createClient } from '@/lib/supabase';
import { Upload, X, Loader } from 'lucide-react';
import { Button } from '@/components/ui';

interface ImageUploadProps {
  userId: string;
  currentImage?: string;
  bucket?: string;
  folder?: string;
  onUploadComplete: (url: string) => void;
  className?: string;
}

export function ImageUpload({
  userId,
  currentImage,
  bucket = 'avatars',
  folder = 'profiles',
  onUploadComplete,
  className = '',
}: ImageUploadProps) {
  const supabase = createClient();
  const [isUploading, setIsUploading] = React.useState(false);
  const [preview, setPreview] = React.useState<string>(currentImage || '');
  const [dragOver, setDragOver] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be smaller than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}_${Date.now()}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          upsert: true,
        });

      if (error) {
        throw error;
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      setPreview(publicUrl);
      onUploadComplete(publicUrl);
    } catch (error: any) {
      console.error('Upload error:', error);
      alert(error.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  return (
    <div className={className}>
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
        className="hidden"
      />

      {preview ? (
        <div className="relative inline-block">
          <img
            src={preview}
            alt="Preview"
            className="w-32 h-32 rounded-full object-cover border-2 border-zinc-700"
          />
          <div className="absolute -bottom-1 -right-1 flex gap-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 bg-white text-black rounded-full hover:bg-zinc-200 transition-colors"
              disabled={isUploading}
            >
              <Upload className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={() => {
                setPreview('');
                onUploadComplete('');
              }}
              className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
              <Loader className="h-6 w-6 text-white animate-spin" />
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`w-32 h-32 rounded-full border-2 border-dashed border-zinc-600 flex flex-col items-center justify-center cursor-pointer hover:border-white transition-colors ${
            dragOver ? 'border-white bg-zinc-800' : ''
          } ${isUploading ? 'opacity-50' : ''}`}
        >
          {isUploading ? (
            <Loader className="h-6 w-6 text-zinc-400 animate-spin mb-1" />
          ) : (
            <>
              <Upload className="h-6 w-6 text-zinc-400 mb-1" />
              <span className="text-xs text-zinc-400">Upload</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
