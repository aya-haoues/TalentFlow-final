// src/pages/JobsPage.tsx
import React from 'react';
import { Layout, Typography } from 'antd';
import JobsList from '../components/jobs/JobsList';

const { Content, Footer } = Layout;
const { Title, Paragraph } = Typography;

/**
 * Styles pour harmoniser le rendu du contenu HTML généré par l'IA 
 * (Listes, gras, titres) au sein des cartes de la liste.
 */
const jobListStyles = `
  .job-description-summary {
    color: #4b5563;
    line-height: 1.6;
  }
  .job-description-summary p {
    margin-bottom: 4px;
  }
  .job-description-summary ul, 
  .job-description-summary ol {
    padding-left: 20px;
    margin: 4px 0;
  }
  .job-description-summary strong {
    font-weight: 600;
  }
  /* Limiter l'affichage à 3 lignes pour ne pas casser la grille */
  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

export default function JobsPage() {
  return (
    <Layout style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Injection des styles pour le rendu HTML propre */}
      <style>{jobListStyles}</style>

      <Content style={{ padding: '2rem 1rem', background: '#f5f5f5', flex: 1 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Section En-tête */}
          <div style={{ marginBottom: 40 }}>
            <Title level={2} style={{ textAlign: 'center', color: '#004d4a', marginBottom: 8 }}>
               Toutes nos offres d'emploi
            </Title>
            <Paragraph style={{ textAlign: 'center', color: '#666', fontSize: 16 }}>
              Postulez aux offres qui correspondent à votre profil.
              <br />
              <span style={{ color: '#00a89c', fontWeight: 500 }}>
                💡 Créez un compte pour sauvegarder vos candidatures
              </span>
            </Paragraph>
          </div>

          {/* Note : Assure-toi que dans ton composant <JobsList />, 
              chaque description d'offre est rendue avec :
              <div 
                className="job-description-summary line-clamp-3"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(job.description) }} 
              />
          */}
          <JobsList />
          
        </div>
      </Content>

      <Footer 
        style={{ 
          textAlign: 'center', 
          background: '#004d4a', 
          color: 'rgba(255,255,255,0.85)', 
          padding: '1.5rem' 
        }}
      >
        <span>© 2026 TalentFlow - Plateforme de Recrutement Intelligent</span>
      </Footer>
    </Layout>
  );
}