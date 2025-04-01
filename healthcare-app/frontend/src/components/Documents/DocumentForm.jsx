import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { toast } from 'react-toastify';

function DocumentForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const documentType = searchParams.get('type');

  const [formData, setFormData] = useState({
    type: documentType || 'prescription',
    content: '',
    patientInfo: {
      name: '',
      cpf: '',
      birthDate: ''
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!['prescription', 'certificate', 'exam-request'].includes(documentType)) {
      navigate('/');
    }
  }, [documentType, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('patientInfo.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        patientInfo: {
          ...prev.patientInfo,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/documents', formData);
      toast.success('Documento criado com sucesso');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao criar documento');
    } finally {
      setLoading(false);
    }
  };

  const getTemplate = () => {
    switch (formData.type) {
      case 'prescription':
        return `Paciente: ${formData.patientInfo.name || '[Nome do Paciente]'}\nCPF: ${formData.patientInfo.cpf || '[CPF do Paciente]'}\n\nMedicação:\n1. [Nome do Medicamento] - [Dosagem] - [Posologia]\n2. [Nome do Medicamento] - [Dosagem] - [Posologia]\n\nObservações:\n[Incluir observações relevantes]`;
      case 'certificate':
        return `Paciente: ${formData.patientInfo.name || '[Nome do Paciente]'}\nCPF: ${formData.patientInfo.cpf || '[CPF do Paciente]'}\n\nAtesto para os devidos fins que o(a) paciente encontra-se [em tratamento/incapacitado(a)] devido a [motivo], no período de [data inicial] a [data final].\n\nObservações:\n[Incluir observações relevantes]`;
      case 'exam-request':
        return `Paciente: ${formData.patientInfo.name || '[Nome do Paciente]'}\nCPF: ${formData.patientInfo.cpf || '[CPF do Paciente]'}\nData Nasc.: ${formData.patientInfo.birthDate || '[DD/MM/AAAA]'}\n\nSolicito a realização dos seguintes exames:\n1. [Nome do Exame]\n2. [Nome do Exame]\n\nJustificativa:\n[Incluir justificativa clínica]`;
      default:
        return '';
    }
  };

  const applyTemplate = () => {
    setFormData(prev => ({
      ...prev,
      content: getTemplate()
    }));
  };

  const getDocumentTitle = () => {
    switch (formData.type) {
      case 'prescription':
        return 'Novo Receituário';
      case 'certificate':
        return 'Novo Atestado';
      case 'exam-request':
        return 'Nova Solicitação de Exame';
      default:
        return 'Novo Documento';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{getDocumentTitle()}</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Paciente
              </label>
              <input
                type="text"
                name="patientInfo.name"
                value={formData.patientInfo.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CPF do Paciente
              </label>
              <input
                type="text"
                name="patientInfo.cpf"
                value={formData.patientInfo.cpf}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="000.000.000-00"
                required
              />
            </div>
            {formData.type === 'exam-request' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Nascimento
                </label>
                <input
                  type="date"
                  name="patientInfo.birthDate"
                  value={formData.patientInfo.birthDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            )}
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Conteúdo do Documento
              </label>
              <button
                type="button"
                onClick={applyTemplate}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Usar Modelo
              </button>
            </div>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows={15}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              required
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Salvando...' : 'Salvar Documento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DocumentForm;