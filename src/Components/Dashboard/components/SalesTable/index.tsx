import React from 'react';
import type { Sale } from '../../../../types/Sales';
import { getEstagioLabel, getVendedorName } from '../../utils/formatters';
import styles from './styles.module.scss';

interface SalesTableProps {
  vendas: Sale[];
  users: any[];
  darkMode: boolean;
}

const SalesTable: React.FC<SalesTableProps> = ({ vendas, users, darkMode }) => {
  const getLinhaTabelaClasse = (estagio: string) => {
    if (estagio === 'finalizado') return styles.linhaFechada; 
    if (estagio === 'perdida') return styles.linhaPerdida;
    return '';
  };

  const displayedVendas = vendas.slice(0, 10);

  return (
    <div className={`${styles.tabelaContainer} ${darkMode ? styles.dark : ''}`}>
      <div className={styles.tabelaHeader}>
        <div className={`${styles.tabelaTitulo} ${darkMode ? styles.dark : ''}`}>
          Vendas Recentes
        </div>
        <div className={`${styles.tabelaInfo} ${darkMode ? styles.dark : ''}`}>
          Mostrando {displayedVendas.length} vendas mais recentes (todos os estágios)
        </div>
      </div>
      <div className={styles.tableWrapper}>
        <table className={`${styles.tabelaVendas} ${darkMode ? styles.dark : ''}`}>
          <thead>
            <tr>
              <th>Data</th>
              <th>Nome da Empresa</th>
              <th>Tipo</th>
              <th>Nome Contato</th>
              <th>Forma de Contato</th>
              <th>Estágio</th>
              <th>Tipo de Produto</th>
              <th>Vendedor</th>
            </tr>
          </thead>
          <tbody>
            {displayedVendas.map((venda) => (
              <tr key={venda.id} className={getLinhaTabelaClasse(venda.stage)}>
                <td>{venda.date}</td>
                <td className={`${styles.empresa} ${darkMode ? styles.dark : ''}`}>{venda.companyName}</td>
                <td>{venda.type}</td>
                <td>{venda.contactName}</td>
                <td>{venda.contactMethod}</td>
                <td>
                  <span className={`${styles.estagio} ${styles[venda.stage]}`}>
                    {getEstagioLabel(venda.stage)}
                  </span>
                </td>
                <td>{venda.productType}</td>
                <td>{getVendedorName(venda.salesPerson, users)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {vendas.length === 0 && (
        <div className={`${styles.emptyState} ${darkMode ? styles.dark : ''}`}>
          Nenhuma venda encontrada
        </div>
      )}
    </div>
  );
};

export default SalesTable;