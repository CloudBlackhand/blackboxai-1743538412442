import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { toast } from 'react-toastify';
import * as signatureService from '../../services/signatureService';

function DocumentView() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [signatureLoading, setSignatureLoading] = useState(false);
  const [qrCode, setQrCode] = useState(null);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await api.get(`/documents/${id}`);
        setDocument(response.data.data.document);
      } catch (error) {
        toast.error('Erro ao carregar documento');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id, navigate]);

  const handleRequestSignature = async () => {
    setSignatureLoading(true);
    try {
      const response = await signatureService.requestSignature(id);
      setQrCode(response.qrCode);
      toast.success('Solicitação de assinatura enviada');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao solicitar assinatura');
    } finally {
      setSignatureLoading(false);
    }
  };

  const handleVerifySignature = async () => {
    try {
      await signatureService.verifySignature(id);
      const response = await api.get(`/documents/${id}`);
      setDocument(response.data.data.document);
      toast.success('Status de assinatura atualizado');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao verificar assinatura');
    }
  };

  const handleDownloadPdf = async () => {
    try {
      const pdfBlob = await signatureService.downloadSignedPdf(id);
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${document.type}-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('Erro ao baixar documento');
    }
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
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 capitalize">
              {document.type === 'prescription' && 'Receituário'}
              {document.type === 'certificate' && 'Atestado'}
              {document.type === 'exam-request' && 'Solicitação de Exame'}
            </h2>
            <p className="text-sm text-gray-500">
              Criado em: {new Date(document.createdAt).toLocaleDateString('pt-BR')}
            </p>
          </div>
          <div className="flex space-x-2">
            {document.status === 'signed' && (
              <button
                onClick={handleDownloadPdf}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <i className="fas fa-download mr-2"></i>Baixar PDF
              </button>
            )}
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Voltar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-medium text-gray-700 mb-2">Paciente</h3>
            <p>{document.patientInfo?.name || 'Não informado'}</p>
            <p className="text-sm text-gray-500">CPF: {document.patientInfo?.cpf || 'Não informado'}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-medium text-gray-700 mb-2">Status</h3>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              document.status === 'signed' ? 'bg-green-100 text-green-800' :
              document.status === 'pending-signature' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {document.status === 'draft' && 'Rascunho'}
              {document.status === 'pending-signature' && 'Assinatura Pendente'}
              {document.status === 'signed' && 'Assinado'}
            </span>
            {document.signedAt && (
              <p className="text-sm text-gray-500 mt-1">
                Assinado em: {new Date(document.signedAt).toLocaleDateString('pt-BR')}
              </p>
            )}
          </div>
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-medium text-gray-700 mb-2">Profissional</h3>
            <p>Dr. {user?.name}</p>
            <p className="text-sm text-gray-500">CRM: {user?.crm}</p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-medium text-gray-700 mb-2">Conteúdo</h3>
          <div className="bg-gray-50 p-4 rounded-md whitespace-pre-wrap font-mono text-sm">
            {document.content}
          </div>
        </div>

        {document.status === 'draft' && (
          <div className="flex justify-end">
            <button
              onClick={handleRequestSignature}
              disabled={signatureLoading}
              className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${signatureLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {signatureLoading ? 'Processando...' : 'Solicitar Assinatura'}
            </button>
          </div>
        )}

        {document.status === 'pending-signature' && (
          <div className="bg-yellow-50 p-4 rounded-md">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <h3 className="font-medium text-yellow-800 mb-2">Assinatura Pendente</h3>
                <p className="text-yellow-700">
                  Aguardando assinatura digital via Gov.br. O paciente deve assinar usando seu login Gov.br.
                </p>
              </div>
              <div className="flex space-x-4">
                {qrCode && (
                  <div className="text-center">
                    <img src={qrCode} alt="QR Code para assinatura" className="w-24 h-24 mx-auto" />
                    <p className="text-xs text-yellow-700 mt-1">Escaneie para assinar</p>
                  </div>
                )}
                <button
                  onClick={handleVerifySignature}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                >
                  Verificar Assinatura
                </button>
              </div>
            </div>
          </div>
        )}

        {document.status === 'signed' && (
          <div className="bg-green-50 p-4 rounded-md">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium text-green-800">Documento Assinado</h3>
                <p className="text-green-700">
                  Este documento foi assinado digitalmente via Gov.br e possui validade legal.
                </p>
              </div>
              <button
                onClick={handleDownloadPdf}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <i className="fas fa-download mr-2"></i>Baixar PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DocumentView;