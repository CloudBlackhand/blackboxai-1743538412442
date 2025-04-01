import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const DocumentCard = ({ document }) => {
  const getDocumentIcon = () => {
    switch (document.type) {
      case 'prescription':
        return 'fa-prescription text-blue-500';
      case 'certificate':
        return 'fa-file-certificate text-green-500';
      case 'exam-request':
        return 'fa-microscope text-purple-500';
      default:
        return 'fa-file text-gray-500';
    }
  };

  const getStatusColor = () => {
    switch (document.status) {
      case 'signed':
        return 'bg-green-100 text-green-800';
      case 'pending-signature':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Link
      to={`/documents/${document._id}`}
      className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow flex items-center"
    >
      <div className="mr-4">
        <i className={`fas ${getDocumentIcon()} text-2xl`}></i>
      </div>
      <div className="flex-grow">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-gray-800 capitalize">
            {document.type === 'prescription' && 'Receituário'}
            {document.type === 'certificate' && 'Atestado'}
            {document.type === 'exam-request' && 'Solicitação de Exame'}
          </h3>
          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor()}`}>
            {document.status === 'draft' && 'Rascunho'}
            {document.status === 'pending-signature' && 'Assinatura Pendente'}
            {document.status === 'signed' && 'Assinado'}
            {document.status === 'expired' && 'Expirado'}
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Paciente: {document.patientInfo?.name || 'Não informado'}
        </p>
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-gray-400">
            Criado em: {format(new Date(document.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
          </span>
          {document.signedAt && (
            <span className="text-xs text-green-500">
              Assinado em: {format(new Date(document.signedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default DocumentCard;