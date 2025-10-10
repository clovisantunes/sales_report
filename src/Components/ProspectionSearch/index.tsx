import React, { useState, useEffect } from 'react';
import { FiSearch, FiX, FiCheck } from 'react-icons/fi';
import { prospectionsService } from '../../services/ProspectionsService/ProspectionsService';
import type { Prospection } from '../../types/Prospections';
import styles from './styles.module.scss';

interface ProspectionSearchProps {
  darkMode: boolean;
  onSelectProspection: (prospection: Prospection) => void;
  currentUser: any;
}

const ProspectionSearch: React.FC<ProspectionSearchProps> = ({
  darkMode,
  onSelectProspection,
  currentUser
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [prospections, setProspections] = useState<Prospection[]>([]);
  const [filteredProspections, setFilteredProspections] = useState<Prospection[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProspections();
  }, []);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      const filtered = prospections.filter(prospection =>
        prospection.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prospection.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prospection.contactEmail?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProspections(filtered);
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  }, [searchTerm, prospections]);

  const loadProspections = async () => {
    try {
      setLoading(true);
      const prospectionsData = await prospectionsService.getProspections();
      const userProspections = currentUser?.isAdmin 
        ? prospectionsData 
        : prospectionsData.filter(p => p.assignedTo === currentUser?.id);
      setProspections(userProspections);
    } catch (error) {
      console.error('Erro ao carregar prospecções:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProspection = (prospection: Prospection) => {
    onSelectProspection(prospection);
    setSearchTerm('');
    setShowResults(false);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setShowResults(false);
  };

  

  return (
    <div className={`${styles.prospectionSearch} ${darkMode ? styles.dark : ''}`}>
      <div className={styles.searchContainer}>
        <label htmlFor="prospectionSearch">Buscar Prospecção Cadastrada</label>
        <div className={styles.searchInputWrapper}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            id="prospectionSearch"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Digite nome da empresa, contato ou email..."
            className={darkMode ? styles.dark : ''}
          />
          {searchTerm && (
            <button
              className={styles.clearButton}
              onClick={handleClearSearch}
              aria-label="Limpar busca"
            >
              <FiX size={16} />
            </button>
          )}
        </div>

        {showResults && (
          <div className={`${styles.resultsContainer} ${darkMode ? styles.dark : ''}`}>
            {loading ? (
              <div className={styles.loading}>Carregando...</div>
            ) : filteredProspections.length === 0 ? (
              <div className={styles.noResults}>
                Nenhuma prospecção encontrada
              </div>
            ) : (
              <div className={styles.resultsList}>
                {filteredProspections.map((prospection) => (
                  <div
                    key={prospection.id}
                    className={styles.resultItem}
                    onClick={() => handleSelectProspection(prospection)}
                  >
                    <div className={styles.resultContent}>
                      <div className={styles.companyName}>
                        {prospection.companyName}
                      </div>
                      <div className={styles.contactInfo}>
                        {prospection.contactName} • {prospection.contactEmail} • {prospection.productType}
                      </div>
                      {prospection.notes && (
                        <div className={styles.notes}>
                          {prospection.notes}
                        </div>
                      )}
                    </div>
                    <FiCheck className={styles.selectIcon} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProspectionSearch;