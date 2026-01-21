import React, { useState } from 'react';
import { Class, Photo } from '../types';

interface AdminPanelProps {
  currentYearId: string;
  allClasses: Class[];
  photos: Photo[];
  onAddPhoto: (photo: Omit<Photo, 'id' | 'createdAt'>) => void;
  onDeletePhoto: (id: string) => void;
}

interface SelectedImage {
  id: string;
  data: string;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  currentYearId,
  allClasses,
  photos,
  onAddPhoto,
  onDeletePhoto,
}) => {
  const [selectedClassId, setSelectedClassId] = useState(
    allClasses[0]?.id || ''
  );
  const [description, setDescription] = useState('');
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  /* ================== CHỌN FILE ================== */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImages((prev) => [
          ...prev,
          {
            id: Math.random().toString(36).substring(2, 9),
            data: reader.result as string,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const removeSelectedImage = (id: string) => {
    setSelectedImages((prev) => prev.filter((img) => img.id !== id));
  };

  /* ================== SUBMIT ================== */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId || selectedImages.length === 0) return;

    setIsUploading(true);

    selectedImages.forEach((img) => {
      onAddPhoto({
        classId: selectedClassId,
        yearId: currentYearId,
        url: img.data,
        description: description || 'Ảnh môi trường lớp học',
      });
    });

    setDescription('');
    setSelectedImages([]);
    setIsUploading(false);

    alert(`Đã tải lên ${selectedImages.length} ảnh`);
  };

  const yearPhotos = photos.filter(
    (p) => p.yearId === currentYearId
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-20 animate-fade-in">
      {/* ================== FORM UPLOAD ================== */}
      <div className="lg:col-span-1">
        <section className="bg-white rounded-3xl border border-emerald-100 p-6 shadow-sm">
          <h3 className="text-xl font-black text-emerald-900 mb-6">
            Tải lên hình ảnh
          </h3>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* ===== SELECT LỚP (ĐÃ SỬA LỖI OPTION) ===== */}
            <div>
