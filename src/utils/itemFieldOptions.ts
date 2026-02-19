/* eslint-disable @typescript-eslint/no-explicit-any */
export interface FieldOption {
  id: string;
  label: string;
  visible: boolean;
}

export const getFieldOptionsForItem = (
  sectionType: string,
  itemData?: any
): FieldOption[] => {
  switch (sectionType) {
    case 'experience':
      return [
        {
          id: 'title',
          label: 'Afficher le titre',
          visible: itemData?.showTitle !== false,
        },
        {
          id: 'company',
          label: "Afficher le nom de l'entreprise",
          visible: itemData?.showCompany !== false,
        },
        {
          id: 'description',
          label: 'Afficher la description',
          visible: itemData?.showDescription !== false,
        },
        {
          id: 'location',
          label: "Afficher l'emplacement",
          visible: itemData?.showLocation !== false,
        },
        {
          id: 'period',
          label: 'Afficher la période',
          visible: itemData?.showPeriod !== false,
        },
        {
          id: 'url',
          label: 'Afficher le lien',
          visible: itemData?.showUrl === true,
        },
        {
          id: 'logo',
          label: "Afficher le logo de l'entreprise",
          visible: itemData?.showLogo === true,
        },
      ];

    case 'education':
      return [
        {
          id: 'degree',
          label: 'Afficher le diplôme',
          visible: itemData?.showDegree !== false,
        },
        {
          id: 'institution',
          label: "Afficher l'établissement",
          visible: itemData?.showInstitution !== false,
        },
        {
          id: 'period',
          label: 'Afficher la période',
          visible: itemData?.showPeriod !== false,
        },
        {
          id: 'location',
          label: "Afficher l'emplacement",
          visible: itemData?.showLocation === true,
        },
        {
          id: 'score',
          label: 'Afficher la note/mention',
          visible: itemData?.showScore !== false,
        },
        {
          id: 'description',
          label: 'Afficher la description',
          visible: itemData?.showDescription === true,
        },
      ];

    case 'projects':
      return [
        {
          id: 'name',
          label: 'Afficher le nom',
          visible: itemData?.showName !== false,
        },
        {
          id: 'description',
          label: 'Afficher la description',
          visible: itemData?.showDescription !== false,
        },
        {
          id: 'url',
          label: 'Afficher le lien',
          visible: itemData?.showUrl === true,
        },
        {
          id: 'technologies',
          label: 'Afficher les technologies',
          visible: itemData?.showTechnologies === true,
        },
        {
          id: 'date',
          label: 'Afficher la date',
          visible: itemData?.showDate === true,
        },
      ];

    case 'languages':
      return [
        {
          id: 'language',
          label: 'Afficher la langue',
          visible: itemData?.showLanguage !== false,
        },
        {
          id: 'fluency',
          label: 'Afficher le niveau',
          visible: itemData?.showFluency !== false,
        },
        {
          id: 'certificate',
          label: 'Afficher la certification',
          visible: itemData?.showCertificate === true,
        },
      ];

    case 'certifications':
      return [
        {
          id: 'name',
          label: 'Afficher le nom',
          visible: itemData?.showName !== false,
        },
        {
          id: 'issuer',
          label: "Afficher l'organisme",
          visible: itemData?.showIssuer !== false,
        },
        {
          id: 'date',
          label: 'Afficher la date',
          visible: itemData?.showDate !== false,
        },
        {
          id: 'url',
          label: 'Afficher le lien',
          visible: itemData?.showUrl === true,
        },
        {
          id: 'description',
          label: 'Afficher la description',
          visible: itemData?.showDescription === true,
        },
      ];

    case 'skills':
      return [
        {
          id: 'name',
          label: 'Afficher le nom',
          visible: itemData?.showName !== false,
        },
        {
          id: 'level',
          label: 'Afficher le niveau',
          visible: itemData?.showLevel === true,
        },
        {
          id: 'keywords',
          label: 'Afficher les mots-clés',
          visible: itemData?.showKeywords === true,
        },
      ];

    case 'awards':
      return [
        {
          id: 'title',
          label: 'Afficher le titre',
          visible: itemData?.showTitle !== false,
        },
        {
          id: 'awarder',
          label: "Afficher l'organisme",
          visible: itemData?.showAwarder !== false,
        },
        {
          id: 'date',
          label: 'Afficher la date',
          visible: itemData?.showDate !== false,
        },
        {
          id: 'summary',
          label: 'Afficher le résumé',
          visible: itemData?.showSummary === true,
        },
      ];

    case 'volunteer':
      return [
        {
          id: 'organization',
          label: "Afficher l'organisation",
          visible: itemData?.showOrganization !== false,
        },
        {
          id: 'position',
          label: 'Afficher le poste',
          visible: itemData?.showPosition !== false,
        },
        {
          id: 'startDate',
          label: 'Afficher la date de début',
          visible: itemData?.showStartDate !== false,
        },
        {
          id: 'endDate',
          label: 'Afficher la date de fin',
          visible: itemData?.showEndDate === true,
        },
        {
          id: 'summary',
          label: 'Afficher le résumé',
          visible: itemData?.showSummary === true,
        },
      ];

    case 'publications':
      return [
        {
          id: 'name',
          label: 'Afficher le nom',
          visible: itemData?.showName !== false,
        },
        {
          id: 'publisher',
          label: "Afficher l'éditeur",
          visible: itemData?.showPublisher !== false,
        },
        {
          id: 'releaseDate',
          label: 'Afficher la date',
          visible: itemData?.showReleaseDate !== false,
        },
        {
          id: 'url',
          label: 'Afficher le lien',
          visible: itemData?.showUrl === true,
        },
        {
          id: 'summary',
          label: 'Afficher le résumé',
          visible: itemData?.showSummary === true,
        },
      ];

    case 'references':
      return [
        {
          id: 'name',
          label: 'Afficher le nom',
          visible: itemData?.showName !== false,
        },
        {
          id: 'reference',
          label: 'Afficher la référence',
          visible: itemData?.showReference !== false,
        },
        {
          id: 'phone',
          label: 'Afficher le téléphone',
          visible: itemData?.showPhone === true,
        },
        {
          id: 'email',
          label: "Afficher l'email",
          visible: itemData?.showEmail === true,
        },
      ];

    case 'interests':
      return [
        {
          id: 'name',
          label: 'Afficher le nom',
          visible: itemData?.showName !== false,
        },
        {
          id: 'keywords',
          label: 'Afficher les mots-clés',
          visible: itemData?.showKeywords === true,
        },
      ];

    default:
      return [
        {
          id: 'name',
          label: 'Afficher le nom',
          visible: itemData?.showName !== false,
        },
        {
          id: 'description',
          label: 'Afficher la description',
          visible: itemData?.showDescription !== false,
        },
      ];
  }
};
