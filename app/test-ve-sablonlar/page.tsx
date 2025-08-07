"use client";
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { Header } from '@/components/header';
import { FileText, ClipboardList, Eye, ExternalLink, Copy, Edit, Trash2, Plus, X } from 'lucide-react';

// Modal bileşeni
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}
const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
};

interface Item {
  id: number;
  name: string;
  description: string;
  googleSheetUrl?: string;
  googleFormUrl?: string;
}

const initialTests: Item[] = [
  {
    id: 1,
    name: "MMPI",
    description: "Minnesota Çok Yönlü Kişilik Envanteri.",
    googleSheetUrl: "",
    googleFormUrl: "",
  },
  {
    id: 2,
    name: "Üç Boyutlu Bağlanma",
    description: "Bağlanma stillerini değerlendiren test.",
    googleSheetUrl: "",
    googleFormUrl: "",
  },
  {
    id: 3,
    name: "Young Şema Terapi",
    description: "Young Şema Terapi test formu.",
    googleSheetUrl: "",
    googleFormUrl: "",
  },
  {
    id: 4,
    name: "PBQ-S1",
    description: "PBQ-S1 kişilik inançları ölçeği.",
    googleSheetUrl: "",
    googleFormUrl: "",
  },
];

export default function TestVeSablonlarPage() {
  const [tests, setTests] = useState<Item[]>(initialTests);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [modalType, setModalType] = useState<string>(''); // 'view', 'edit', 'delete', 'add-test'
  const [notification, setNotification] = useState<string>('');
  const [editForm, setEditForm] = useState<{ name: string; description: string; googleSheetUrl: string; googleFormUrl: string }>({ name: '', description: '', googleSheetUrl: '', googleFormUrl: '' });
  const [addTestForm, setAddTestForm] = useState<{ name: string; description: string; googleSheetUrl: string; googleFormUrl: string }>({ name: '', description: '', googleSheetUrl: '', googleFormUrl: '' });
  const [addTemplateForm, setAddTemplateForm] = useState<{ name: string; description: string; googleSheetUrl: string; googleFormUrl: string }>({ name: '', description: '', googleSheetUrl: '', googleFormUrl: '' });

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleGoogleSheets = (item: Item) => {
    if (item.googleSheetUrl) {
      window.open(item.googleSheetUrl, '_blank');
    } else {
      showNotification('Google Sheets linki bulunamadı!');
    }
  };

  const handleGoogleForms = (item: Item) => {
    if (item.googleFormUrl) {
      window.open(item.googleFormUrl, '_blank');
    } else {
      showNotification('Google Forms linki bulunamadı!');
    }
  };

  const handleCopy = (item: Item) => {
    const textToCopy = item.googleFormUrl || 'Google Forms linki yok';
    navigator.clipboard.writeText(textToCopy).then(() => {
      showNotification('Google Forms linki kopyalandı!');
    }).catch(() => {
      showNotification('Kopyalama başarısız!');
    });
  };

  const handleView = (item: Item) => {
    setSelectedItem(item);
    setModalType('view');
  };

  const handleEdit = (item: Item) => {
    setSelectedItem(item);
    setEditForm({
      name: item.name,
      description: item.description,
      googleSheetUrl: item.googleSheetUrl || '',
      googleFormUrl: item.googleFormUrl || '',
    });
    setModalType('edit');
  };

  const handleDelete = (item: Item) => {
    setSelectedItem(item);
    setModalType('delete');
  };

  const confirmDelete = () => {
    if (selectedItem) {
      if (tests.find((t) => t.id === selectedItem.id)) {
        setTests(tests.filter((t) => t.id !== selectedItem.id));
      } else {
        setTemplates(templates.filter((t) => t.id !== selectedItem.id));
      }
      showNotification(`${selectedItem.name} silindi!`);
      closeModal();
    }
  };

  const saveEdit = () => {
    if (selectedItem && editForm.name.trim() && editForm.description.trim()) {
      const updatedItem: Item = {
        ...selectedItem,
        name: editForm.name,
        description: editForm.description,
        googleSheetUrl: editForm.googleSheetUrl,
        googleFormUrl: editForm.googleFormUrl,
      };

      if (tests.find((t) => t.id === selectedItem.id)) {
        setTests(tests.map((t) => t.id === selectedItem.id ? updatedItem : t));
      } else {
        setTemplates(templates.map((t) => t.id === selectedItem.id ? updatedItem : t));
      }

      showNotification(`${selectedItem.name} güncellendi!`);
      closeModal();
    } else {
      showNotification('Lütfen tüm alanları doldurun!');
    }
  };


  const closeModal = (): void => {
    setModalType('');
    setSelectedItem(null);
    setEditForm({ name: '', description: '', googleSheetUrl: '', googleFormUrl: '' });
    setAddTestForm({ name: '', description: '', googleSheetUrl: '', googleFormUrl: '' });
    setAddTemplateForm({ name: '', description: '', googleSheetUrl: '', googleFormUrl: '' });
  };

  const openAddTestModal = () => {
    setAddTestForm({ name: '', description: '', googleSheetUrl: '', googleFormUrl: '' });
    setModalType('add-test');
  };

  const openAddTemplateModal = () => {
    setAddTemplateForm({ name: '', description: '', googleSheetUrl: '', googleFormUrl: '' });
    setModalType('add-template');
  };

  const handleAddTest = () => {
    if (addTestForm.name.trim() && addTestForm.description.trim()) {
      const newTest: Item = {
        id: tests.length > 0 ? Math.max(...tests.map(t => t.id)) + 1 : 1,
        name: addTestForm.name,
        description: addTestForm.description,
        googleSheetUrl: addTestForm.googleSheetUrl,
        googleFormUrl: addTestForm.googleFormUrl,
      };
      setTests([newTest, ...tests]);
      showNotification(`${addTestForm.name} eklendi!`);
      closeModal();
    } else {
      showNotification('Lütfen tüm alanları doldurun!');
    }
  };

  const handleAddTemplate = () => {
    if (addTemplateForm.name.trim() && addTemplateForm.description.trim()) {
      const newTemplate: Item = {
        id: templates.length > 0 ? Math.max(...templates.map(t => t.id)) + 1 : 1,
        name: addTemplateForm.name,
        description: addTemplateForm.description,
        googleSheetUrl: addTemplateForm.googleSheetUrl,
        googleFormUrl: addTemplateForm.googleFormUrl,
      };
      setTemplates([newTemplate, ...templates]);
      showNotification(`${addTemplateForm.name} eklendi!`);
      closeModal();
    } else {
      showNotification('Lütfen tüm alanları doldurun!');
    }
  };

  const renderButtons = (item: Item) => (
    <div className="flex flex-wrap gap-2 w-full">
      <Button 
        variant="outline" 
        size="sm" 
        className="flex-1 min-w-[120px] flex items-center gap-1 text-xs justify-center"
        onClick={() => handleGoogleSheets(item)}
      >
        <ExternalLink className="h-3 w-3" /> Google Sheets
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        className="flex-1 min-w-[120px] flex items-center gap-1 text-xs justify-center"
        onClick={() => handleGoogleForms(item)}
      >
        <ExternalLink className="h-3 w-3" /> Google Forms
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        className="flex-1 min-w-[100px] flex items-center gap-1 text-xs justify-center"
        onClick={() => handleCopy(item)}
      >
        <Copy className="h-3 w-3" /> Kopyala
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        className="flex-1 min-w-[80px] flex items-center gap-1 text-xs justify-center"
        onClick={() => handleView(item)}
      >
        <Eye className="h-3 w-3" /> Gör
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        className="flex-1 min-w-[90px] flex items-center gap-1 text-xs justify-center"
        onClick={() => handleEdit(item)}
      >
        <Edit className="h-3 w-3" /> Düzenle
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        className="flex-1 min-w-[80px] flex items-center gap-1 text-xs text-red-600 hover:text-red-700 hover:border-red-300 justify-center"
        onClick={() => handleDelete(item)}
      >
        <Trash2 className="h-3 w-3" /> Sil
      </Button>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      {/* Bildirim */}
      {notification && (
        <div className="fixed top-4 right-4 z-40">
          <Alert className="bg-green-100 border-green-500 text-green-700">
            <AlertDescription>{notification}</AlertDescription>
          </Alert>
        </div>
      )}

      <main className="flex-grow flex flex-col items-center justify-start p-6 md:p-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">Test ve Şablonlar</h1>
        
        {/* Testler */}
        <section className="w-full max-w-5xl mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-blue-500" /> Testler
          </h2>
          <Button variant="default" size="sm" className="flex items-center gap-1" onClick={openAddTestModal}>
            <Plus className="h-4 w-4" /> Test Ekle
          </Button>
        </div>
      {/* Test Ekle Modal */}
      <Modal isOpen={modalType === 'add-test'} onClose={closeModal} title="Yeni Test Ekle">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">İsim:</label>
            <input
              type="text"
              value={addTestForm.name}
              onChange={(e) => setAddTestForm({ ...addTestForm, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Açıklama:</label>
            <textarea
              value={addTestForm.description}
              onChange={(e) => setAddTestForm({ ...addTestForm, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Google Sheets URL:</label>
            <input
              type="url"
              value={addTestForm.googleSheetUrl}
              onChange={(e) => setAddTestForm({ ...addTestForm, googleSheetUrl: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Google Forms URL:</label>
            <input
              type="url"
              value={addTestForm.googleFormUrl}
              onChange={(e) => setAddTestForm({ ...addTestForm, googleFormUrl: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={closeModal}>İptal</Button>
            <Button onClick={handleAddTest}>Ekle</Button>
          </div>
        </div>
      </Modal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map((test) => (
              <Card key={test.id} className="dark:bg-gray-800 dark:border-gray-700 shadow-lg rounded-xl">
                <CardHeader className="pb-2 flex flex-row items-center gap-2">
                  <FileText className="h-6 w-6 text-purple-500" />
                  <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">{test.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-gray-700 dark:text-gray-200 pb-4">
                  <p className="mb-4 text-sm">{test.description}</p>
                  {renderButtons(test)}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
        
        {/* Hazırlık, İlk Görüşme ve Değerlendirme Formları */}
        <section className="w-full max-w-5xl">
          {/* Hazırlık */}
          <div className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-4">
              <ClipboardList className="h-6 w-6 text-blue-500" /> Hazırlık
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { id: 101, name: "Hazırlık (Çocuk)", description: "Çocuklar için hazırlık formu.", googleSheetUrl: "", googleFormUrl: "" },
                { id: 102, name: "Hazırlık (Çift)", description: "Çiftler için hazırlık formu.", googleSheetUrl: "", googleFormUrl: "" },
                { id: 103, name: "Hazırlık (Yetişkin)", description: "Yetişkinler için hazırlık formu.", googleSheetUrl: "", googleFormUrl: "" },
              ].map((item) => (
                <Card key={item.id} className="dark:bg-gray-800 dark:border-gray-700 shadow-lg rounded-xl">
                  <CardHeader className="pb-2 flex flex-row items-center gap-2">
                    <FileText className="h-6 w-6 text-green-500" />
                    <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">{item.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-gray-700 dark:text-gray-200 pb-4">
                    <p className="mb-4 text-sm">{item.description}</p>
                    {renderButtons(item)}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          {/* İlk Görüşme */}
          <div className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-4">
              <ClipboardList className="h-6 w-6 text-blue-500" /> İlk Görüşme
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { id: 201, name: "İlk Görüşme (Çocuk)", description: "Çocuklar için ilk görüşme formu.", googleSheetUrl: "", googleFormUrl: "" },
                { id: 202, name: "İlk Görüşme (Çift)", description: "Çiftler için ilk görüşme formu.", googleSheetUrl: "", googleFormUrl: "" },
                { id: 203, name: "İlk Görüşme (Yetişkin)", description: "Yetişkinler için ilk görüşme formu.", googleSheetUrl: "", googleFormUrl: "" },
              ].map((item) => (
                <Card key={item.id} className="dark:bg-gray-800 dark:border-gray-700 shadow-lg rounded-xl">
                  <CardHeader className="pb-2 flex flex-row items-center gap-2">
                    <FileText className="h-6 w-6 text-green-500" />
                    <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">{item.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-gray-700 dark:text-gray-200 pb-4">
                    <p className="mb-4 text-sm">{item.description}</p>
                    {renderButtons(item)}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          {/* Değerlendirme */}
          <div className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-4">
              <ClipboardList className="h-6 w-6 text-blue-500" /> Değerlendirme
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { id: 301, name: "Değerlendirme (Çocuk)", description: "Çocuklar için değerlendirme formu.", googleSheetUrl: "", googleFormUrl: "" },
                { id: 302, name: "Değerlendirme (Çift)", description: "Çiftler için değerlendirme formu.", googleSheetUrl: "", googleFormUrl: "" },
                { id: 303, name: "Değerlendirme (Yetişkin)", description: "Yetişkinler için değerlendirme formu.", googleSheetUrl: "", googleFormUrl: "" },
              ].map((item) => (
                <Card key={item.id} className="dark:bg-gray-800 dark:border-gray-700 shadow-lg rounded-xl">
                  <CardHeader className="pb-2 flex flex-row items-center gap-2">
                    <FileText className="h-6 w-6 text-green-500" />
                    <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">{item.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-gray-700 dark:text-gray-200 pb-4">
                    <p className="mb-4 text-sm">{item.description}</p>
                    {renderButtons(item)}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* View Modal */}
      <Modal isOpen={modalType === 'view'} onClose={closeModal} title="Detayları Görüntüle">
        {selectedItem && (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">İsim:</h4>
              <p className="text-gray-700 dark:text-gray-300">{selectedItem.name}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Açıklama:</h4>
              <p className="text-gray-700 dark:text-gray-300">{selectedItem.description}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Google Sheets URL:</h4>
              <p className="text-gray-700 dark:text-gray-300 break-all">
                {selectedItem.googleSheetUrl || 'Belirtilmemiş'}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Google Forms URL:</h4>
              <p className="text-gray-700 dark:text-gray-300 break-all">
                {selectedItem.googleFormUrl || 'Belirtilmemiş'}
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={modalType === 'edit'} onClose={closeModal} title="Düzenle">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">İsim:</label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm({...editForm, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Açıklama:</label>
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm({...editForm, description: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Google Sheets URL:</label>
            <input
              type="url"
              value={editForm.googleSheetUrl}
              onChange={(e) => setEditForm({...editForm, googleSheetUrl: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Google Forms URL:</label>
            <input
              type="url"
              value={editForm.googleFormUrl || ''}
              onChange={(e) => setEditForm({...editForm, googleFormUrl: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={closeModal}>İptal</Button>
            <Button onClick={saveEdit}>Kaydet</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={modalType === 'delete'} onClose={closeModal} title="Silmeyi Onayla">
        {selectedItem && (
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              <strong>{selectedItem.name}</strong> isimli öğeyi silmek istediğinizden emin misiniz?
              Bu işlem geri alınamaz.
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={closeModal}>İptal</Button>
              <Button variant="destructive" onClick={confirmDelete}>Sil</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}