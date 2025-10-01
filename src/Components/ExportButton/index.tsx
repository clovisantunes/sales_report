import React, { useState } from 'react';
import { FiDownload, FiFileText, FiX } from 'react-icons/fi';
import { ExportService } from '../../services/exportService/exportService';
import type { Sale } from '../../types/Sales';
import styles from './styles.module.scss';

interface ExportButtonProps {
  sales: Sale[];
  users: any[];
  products: any[];
  darkMode?: boolean;
  disabled?: boolean;
  className?: string;
}

const ExportButton: React.FC<ExportButtonProps> = ({
  sales,
  users,
  products,
  darkMode = false,
  disabled = false,
  className = ''
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExport = (format: 'excel' | 'csv') => {
    if (sales.length === 0) return;

    setExporting(true);
    
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `vendas_${timestamp}.${format === 'excel' ? 'xlsx' : 'csv'}`;
      
      if (format === 'excel') {
        ExportService.exportSalesToExcel(sales, users, products, filename);
      } else {
        exportToCSV(sales, filename);
      }
      
      setTimeout(() => {
        setExporting(false);
        setShowOptions(false);
      }, 1000);
      
    } catch (error) {
      console.error('Erro na exportação:', error);
      setExporting(false);
    }
  };

  const exportToCSV = (sales: Sale[], filename: string) => {
    const headers = [
      'Data', 'Empresa', 'Tipo', 'Nome do Contato', 'Forma de Contato',
      'Estágio', 'Tipo de Produto', 'Resultado', 'Vendedor', 'Comentários'
    ].join(',');
    
    const csvData = sales.map(sale => [
      sale.date,
      `"${sale.companyName}"`,
      sale.type,
      `"${sale.contactName}"`,
      sale.contactMethod,
      sale.stage,
      `"${sale.productType}"`,
      sale.result,
      `"${sale.salesPerson}"`,
      `"${sale.comments || ''}"`
    ].join(','));
    
    const csvContent = [headers, ...csvData].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className={`${styles.exportContainer} ${className}`}>
      <button
        className={`${styles.exportButton} ${darkMode ? styles.dark : ''} ${exporting ? styles.exporting : ''}`}
        onClick={() => setShowOptions(true)}
        disabled={disabled || exporting}
      >
        <FiDownload size={16} />
        {exporting ? 'Exportando...' : 'Exportar'}
      </button>

      {showOptions && (
        <div className={`${styles.exportModal} ${darkMode ? styles.dark : ''}`}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Exportar Dados</h3>
              <button 
                onClick={() => setShowOptions(false)}
                className={styles.closeButton}
              >
                <FiX size={18} />
              </button>
            </div>
            
            <div className={styles.exportInfo}>
              <p>Total de registros: <strong>{sales.length}</strong></p>
              <p>Selecione o formato de exportação:</p>
            </div>

            <div className={styles.exportOptions}>
              <button
                onClick={() => handleExport('excel')}
                className={styles.optionButton}
                disabled={exporting}
              >
                <div className={styles.optionIcon}>
                  <FiFileText size={24} />
                </div>
                <div className={styles.optionText}>
                  <strong>Excel (.xlsx)</strong>
                  <span>Formato completo com formatação</span>
                </div>
              </button>

              <button
                onClick={() => handleExport('csv')}
                className={styles.optionButton}
                disabled={exporting}
              >
                <div className={styles.optionIcon}>
                  <FiFileText size={24} />
                </div>
                <div className={styles.optionText}>
                  <strong>CSV (.csv)</strong>
                  <span>Formato simples para importação</span>
                </div>
              </button>
            </div>

            {exporting && (
              <div className={styles.exportingOverlay}>
                <div className={styles.spinner}></div>
                <p>Gerando arquivo de exportação...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportButton;