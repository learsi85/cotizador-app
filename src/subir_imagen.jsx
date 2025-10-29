import React, { useState } from 'react';
import { Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function ImageUploadForm() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [empresaNombre, setEmpresaNombre] = useState('');

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
        };
        reader.readAsDataURL(file);
        setMessage({ type: '', text: '' });
      } else {
        setMessage({ type: 'error', text: 'Por favor selecciona un archivo de imagen válido' });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setMessage({ type: 'error', text: 'Por favor selecciona una imagen' });
      return;
    }

    if (!empresaNombre.trim()) {
      setMessage({ type: 'error', text: 'Por favor ingresa el nombre de la empresa' });
      return;
    }

    setUploading(true);
    setMessage({ type: '', text: '' });

    const formData = new FormData();
    formData.append('logo', selectedFile);
    formData.append('nombre', empresaNombre);

    try {
      const response = await fetch('http://localhost:3001/api/upload-logo', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Logo cargado exitosamente' });
        setSelectedFile(null);
        setPreview(null);
        setEmpresaNombre('');
      } else {
        setMessage({ type: 'error', text: data.error || 'Error al cargar el logo' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión con el servidor' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
            <Upload className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Cargar Logo de Empresa</h1>
          <p className="text-gray-600 mt-2">Sube el logo para guardar en la base de datos</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de la Empresa
            </label>
            <input
              type="text"
              value={empresaNombre}
              onChange={(e) => setEmpresaNombre(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              placeholder="Ej: Mi Empresa S.A."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar Logo
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 transition bg-gray-50 hover:bg-gray-100"
              >
                {preview ? (
                  <img src={preview} alt="Preview" className="h-28 object-contain" />
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">Click para seleccionar imagen</span>
                  </>
                )}
              </label>
            </div>
          </div>

          {message.text && (
            <div className={`flex items-center gap-2 p-4 rounded-lg ${
              message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span className="text-sm">{message.text}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={uploading || !selectedFile}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Cargando...
              </>
            ) : (
              'Subir Logo'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}