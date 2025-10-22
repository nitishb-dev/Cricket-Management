import React, { useState, useRef } from 'react';
import { Camera, Upload, X, AlertCircle, CheckCircle } from 'lucide-react';

interface ProfilePictureUploadProps {
  currentImageUrl?: string | null;
  onImageUpload: (file: File) => Promise<void>;
  loading?: boolean;
}

export const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  currentImageUrl,
  onImageUpload,
  loading = false
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return 'Please select an image file';
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return 'Image size must be less than 5MB';
    }

    // Check image dimensions (optional)
    return null;
  };

  const handleFileSelect = async (file: File) => {
    setError(null);
    
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    try {
      await onImageUpload(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
      setPreview(null);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const clearPreview = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayImage = preview || currentImageUrl;

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <Camera className="inline w-4 h-4 mr-1" />
        Profile Picture
      </label>

      {/* Image Display/Upload Area */}
      <div className="flex flex-col items-center space-y-4">
        {/* Current/Preview Image */}
        <div className="relative">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg">
            {displayImage ? (
              <img
                src={displayImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400">
                <Camera size={32} className="text-gray-600" />
              </div>
            )}
          </div>
          
          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
            </div>
          )}
        </div>

        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${
            dragOver
              ? 'border-green-400 bg-green-50'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={!loading ? openFileDialog : undefined}
        >
          <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600 mb-1">
            {dragOver ? 'Drop image here' : 'Click to upload or drag and drop'}
          </p>
          <p className="text-xs text-gray-500">
            PNG, JPG, GIF up to 5MB
          </p>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={loading}
        />

        {/* Clear Preview Button */}
        {preview && (
          <button
            type="button"
            onClick={clearPreview}
            disabled={loading}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
          >
            <X size={16} />
            Clear Preview
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700">
          <AlertCircle size={16} />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Success Message */}
      {!loading && preview && !error && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700">
          <CheckCircle size={16} />
          <span className="text-sm">Image uploaded successfully!</span>
        </div>
      )}

      {/* Upload Guidelines */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Recommended: Square images (1:1 ratio) for best results</p>
        <p>• Maximum file size: 5MB</p>
        <p>• Supported formats: JPG, PNG, GIF</p>
      </div>
    </div>
  );
};