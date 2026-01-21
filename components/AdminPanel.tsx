import React, { useState } from 'react';
import { Class, Photo } from '../types';

/* ================== CLOUDINARY CONFIG ================== */
const CLOUD_NAME = 'dzli6qd9s';
const UPLOAD_PRESET = 'mamnon_upload';
/* ======================================================= */

interface AdminPanelProps {
  currentYearId: string;
  allClasses: Class[];
  photos: Photo[];
  onAddPhoto: (photo: Omit<Photo, 'id' | 'createdAt'>) => void;
  onDeletePhoto: (id: string) => void;
}

interface SelectedImage {
  id: string;
  file: File;
  preview: string;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  currentYearId,
  allClasses,
  photos,
  onAddPhoto,
  onDeletePhoto,
}) => {
  const [selectedClassId, setSelectedClassId] = useState(allClasses[0]?.id || '');
  const [description, setDescription] = useState('');
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  /* ================== UPLOAD CLOUDINARY ================== */
  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await res.json();
    return data.secure_url;
  };
  /* ======================================================= */

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const arr = Array.from(files);
    arr.forEach((file) => {
      const preview = URL.createObjectURL(file);
      setSelectedImages((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).slice(2),
          file,
          preview,
        },
      ]);
    });

    e.target.value = '';
  };

  const removeSelectedImage = (id: string) => {
    setSelectedImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedImages.length === 0 || !selectedClassId) return;

    setIsUploading(true);

    try {
      for (const img of selectedImages) {
        const imageUrl = await uploadToCloudinary(img.file);

        onAddPhoto({
          classId: selectedClassId,
          yearId: currentYearId,
          url: imageUrl,
          description: description || 'Ảnh môi trường lớp học',
        });
      }

      alert(`Đã tải lên thành công ${selectedImages.length} ảnh!`);
      setSelectedImages([]);
      setDescription('');
    } catch (err) {
      alert('Có lỗi khi tải ảnh. Vui lòng thử lại.');
    } finally {
      setIsUploading(false);
    }
  };

  const yearPhotos = photos.filter((p) => p.yearId === currentYearId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 pb-20">
      {/* ================= LEFT ================= */}
      <div className="lg:col-span-1">
        <section className="bg-white rounded-3xl border p-6">
          <h3 className="text-xl font-black mb-6">Tải lên hình ảnh</h3>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-bold">Chọn lớp</label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full p-4 rounded-xl bg-emerald-50"
              >
                {allClasses.map((cls) => (
                  <option key={cls.id} value={cls.id}>
