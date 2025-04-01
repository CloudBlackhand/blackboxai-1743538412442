import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import DocumentCard from './DocumentCard';

function Dashboard() {
  const { user, logout } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await api.get('/documents');
        setDocuments(response.data.data.documents);
      } catch (error) {
        toast.error('Erro ao carregar documentos');
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logout realizado com sucesso');
  };

  const handleNewDocument = (type) => {
    navigate(`/documents/new?type=${type}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Bem-vindo, Dr. {user?.name}
        </h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Sair
        </button>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Novo Documento</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => handleNewDocument('prescription')}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-blue-100"
          >
            <div className="text-center">
              <i className="fas fa-prescription text-blue-500 text-4xl mb-2"></i>
              <h3 className="font-medium text-gray-800">Receituário</h3>
            </div>
          </button>
          <button
            onClick={() => handleNewDocument('certificate')}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-green-100"
          >
            <div className="text-center">
              <i className="fas fa-file-certificate text-green-500 text-4xl mb-2"></i>
              <h3 className="font-medium text-gray-800">Atestado</h3>
            </div>
          </button>
          <button
            onClick={() => handleNewDocument('exam-request')}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-purple-100"
          >
            <div className="text-center">
              <i className="fas fa-microscope text-purple-500 text-4xl mb-2"></i>
              <h3 className="font-medium text-gray-800">Solicitação de Exame</h3>
            </div>
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Documentos Recentes</h2>
        {documents.length === 0 ? (
          <p className="text-gray-500">Nenhum documento encontrado</p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {documents.map((doc) => (
              <DocumentCard key={doc._id} document={doc} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;