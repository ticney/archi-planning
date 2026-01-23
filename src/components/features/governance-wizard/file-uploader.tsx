'use client';

import { useState, useRef } from 'react';
import { Upload, X, FileText, CheckCircle, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { AttachmentType } from '@/types/schemas/governance-schema';
import { recordAttachmentAction } from '@/actions/governance-actions';

interface FileUploaderProps {
    requestId: string;
    documentType: AttachmentType;
    label: string;
    onUploadComplete: () => void;
    existingFile?: { filename: string; uploadedAt: string };
    onDelete?: () => void;
}

export function FileUploader({
    requestId,
    documentType,
    label,
    onUploadComplete,
    existingFile,
    onDelete
}: FileUploaderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleUpload(files[0]);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleUpload(e.target.files[0]);
        }
    };

    const handleUpload = async (file: File) => {
        setError(null);
        setIsUploading(true);

        try {
            if (file.size > 10 * 1024 * 1024) {
                throw new Error("File out of size limit (10MB)");
            }

            const supabase = createClient();
            const fileExt = file.name.split('.').pop();
            const fileName = `${requestId}/${documentType}-${Date.now()}.${fileExt}`;
            const filePath = fileName;

            // 1. Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('governance-proofs')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Record in Database via Server Action
            const formData = new FormData();
            formData.append('request_id', requestId);
            formData.append('document_type', documentType);
            formData.append('storage_path', filePath);
            formData.append('filename', file.name);

            const result = await recordAttachmentAction(null, formData);

            if (!result.success) {
                throw new Error(result.error);
            }

            onUploadComplete();
        } catch (err) {
            console.error('Upload failed:', err);
            setError(err instanceof Error ? err.message : 'Upload failed');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    if (existingFile) {
        return (
            <div className="border rounded-lg p-4 flex items-center justify-between bg-green-50 border-green-200">
                <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                        <p className="font-medium text-green-900">{label}</p>
                        <p className="text-sm text-green-700">{existingFile.filename}</p>
                    </div>
                </div>
                {onDelete && (
                    <Button variant="ghost" size="sm" onClick={onDelete} className="text-green-700 hover:text-green-900 hover:bg-green-100">
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <p className="font-medium text-sm text-gray-700">{label}</p>
            <div
                className={cn(
                    "border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-colors cursor-pointer",
                    isDragging ? "border-primary bg-primary/5" : "border-gray-200 hover:border-primary/50",
                    error ? "border-red-300 bg-red-50" : ""
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                />

                {isUploading ? (
                    <div className="flex flex-col items-center space-y-2">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Uploading...</p>
                    </div>
                ) : (
                    <>
                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-center text-muted-foreground">
                            Drag & drop or click to upload
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            PDF, Word, or Image (max 10MB)
                        </p>
                    </>
                )}
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}
