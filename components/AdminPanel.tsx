
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

const AdminPanel: React.FC<AdminPanelProps> = ({ currentYearId, allClasses, photos, onAddPhoto, onDeletePhoto }) => {
  const [selectedClassId, setSelectedClassId] = useState(allClasses[0]?.id || '');
  const [description, setDescription] = useState('');
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    
    // Explicitly typing file as File to fix the 'unknown' to 'Blob' assignment error
    fileArray.forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setSelectedImages(prev => [
          ...prev, 
          { id: Math.random().toString(36).substr(2, 9), data: result }
        ]);
      };
      reader.readAsDataURL(file);
    });
    
    // Reset input value to allow selecting same files again if needed
    e.target.value = '';
  };

  const removeSelectedImage = (id: string) => {
    setSelectedImages(prev => prev.filter(img => img.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedImages.length === 0 || !selectedClassId) return;

    setIsUploading(true);
    
    // Thực hiện thêm từng ảnh một
    selectedImages.forEach(img => {
      onAddPhoto({
        classId: selectedClassId,
        yearId: currentYearId,
        url: img.data,
        description: description || 'Ảnh môi trường lớp học'
      });
    });

    // Reset state sau khi hoàn tất
    setDescription('');
    setSelectedImages([]);
    setIsUploading(false);
    
    alert(`Đã tải lên thành công ${selectedImages.length} ảnh!`);
  };

  const yearPhotos = photos.filter(p => p.yearId === currentYearId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 animate-fade-in pb-20">
      <div className="lg:col-span-1 space-y-6 md:space-y-8">
        <section className="bg-white rounded-3xl shadow-sm border border-emerald-100 p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl md:text-2xl font-black text-emerald-900">Tải lên hình ảnh</h3>
            {selectedImages.length > 0 && (
              <span className="bg-emerald-100 text-emerald-700 text-xs font-black px-2 py-1 rounded-lg">
                {selectedImages.length} ảnh
              </span>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Chọn lớp học</label>
              <select 
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full bg-emerald-50 border border-mint-200 rounded-2xl px-4 py-4 text-emerald-900 font-bold focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all appearance-none"
              >
                {allClasses.map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Mô tả chung (tùy chọn)</label>
              <input 
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Góc xây dựng, trang trí tết..."
                className="w-full bg-emerald-50 border border-mint-200 rounded-2xl px-4 py-4 text-emerald-900 font-medium focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Hình ảnh (có thể chọn nhiều)</label>
              <label className="mt-1 flex flex-col items-center justify-center px-6 py-8 border-2 border-mint-200 border-dashed rounded-2xl bg-emerald-50/50 hover:bg-emerald-50 cursor-pointer transition-colors group">
                <svg className="h-10 w-10 text-emerald-400 group-hover:scale-110 transition-transform" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="mt-2 text-sm text-emerald-700 font-bold">Thêm ảnh vào danh sách</p>
                <input 
                  id="file-upload" 
                  type="file" 
                  className="sr-only" 
                  accept="image/*" 
                  multiple 
                  onChange={handleFileChange} 
                />
              </label>
            </div>

            {selectedImages.length > 0 && (
              <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto p-2 bg-emerald-50 rounded-2xl border border-mint-100">
                {selectedImages.map((img) => (
                  <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden group border border-white">
                    <img src={img.data} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => removeSelectedImage(img.id)}
                      className="absolute top-1 right-1 bg-rose-500 text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity active:scale-90"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button 
              type="submit"
              disabled={selectedImages.length === 0 || isUploading}
              className={`w-full py-5 rounded-2xl font-black text-white shadow-xl transition-all active:scale-95 text-sm tracking-wide ${selectedImages.length > 0 && !isUploading ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' : 'bg-gray-300 cursor-not-allowed'}`}
            >
              {isUploading ? 'ĐANG TẢI LÊN...' : `LƯU ${selectedImages.length} HÌNH ẢNH`}
            </button>
          </form>
        </section>
      </div>

      <div className="lg:col-span-2 space-y-6 md:space-y-8">
        <section className="bg-white rounded-3xl shadow-sm border border-emerald-100 p-6 md:p-8">
          <h3 className="text-xl md:text-2xl font-black text-emerald-900 mb-6">Kho ảnh hiện tại ({yearPhotos.length})</h3>
          
          <div className="-mx-6 md:mx-0 overflow-x-auto px-6 md:px-0">
            <div className="min-w-[500px]">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-mint-100">
                    <th className="pb-4 font-bold text-gray-400 text-[10px] uppercase tracking-wider">Ảnh</th>
                    <th className="pb-4 font-bold text-gray-400 text-[10px] uppercase tracking-wider">Lớp</th>
                    <th className="pb-4 font-bold text-gray-400 text-[10px] uppercase tracking-wider">Mô tả</th>
                    <th className="pb-4 font-bold text-gray-400 text-[10px] uppercase tracking-wider text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-mint-50">
                  {yearPhotos.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-gray-400 italic font-medium">Chưa có ảnh cho năm học này.</td>
                    </tr>
                  ) : (
                    yearPhotos.sort((a,b) => b.createdAt - a.createdAt).map(photo => {
                      const cls = allClasses.find(c => c.id === photo.classId);
                      return (
                        <tr key={photo.id} className="hover:bg-mint-50/50 transition-colors group">
                          <td className="py-4">
                            <img src={photo.url} className="w-16 h-12 object-cover rounded-xl shadow-sm" alt="Thumb" />
                          </td>
                          <td className="py-4 font-black text-emerald-900">Lớp {cls?.name}</td>
                          <td className="py-4 text-sm text-gray-600 font-medium truncate max-w-[150px]">{photo.description}</td>
                          <td className="py-4 text-right">
                            <button 
                              onClick={() => {
                                if(window.confirm('Xóa ảnh này?')) {
                                  onDeletePhoto(photo.id);
                                }
                              }}
                              className="text-rose-500 hover:bg-rose-50 p-2 rounded-xl transition-all"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminPanel;
