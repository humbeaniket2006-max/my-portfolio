import { projects } from '../data/projects.js';

export function addProjectSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': projects.map(project => ({
      '@type': 'CreativeWork',
      name: project.title,
      description: project.solution,
      keywords: project.tags,
      creator: { '@type': 'Person', name: 'Aniket Humbe' }
    }))
  };
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}
