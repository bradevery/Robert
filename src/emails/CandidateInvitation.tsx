import {
  Body,
  Container,
  Head,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

import * as styles from './_styles';

interface CandidateInvitationProps {
  name: string;
  url: string;
  dossierTitle?: string;
}

export default function CandidateInvitation({
  name,
  url,
  dossierTitle,
}: CandidateInvitationProps) {
  return (
    <Html>
      <Head />
      <Preview>Vous êtes invité(e) à rejoindre un dossier - DcBuilder</Preview>
      <Body style={styles.container}>
        <Container style={styles.card}>
          <Text style={styles.logo}>DcBuilder</Text>
          <Text style={styles.heading}>Invitation candidat</Text>
          <Text style={styles.paragraph}>
            Bonjour {name}, vous avez été invité(e) à participer
            {dossierTitle
              ? ` au dossier « ${dossierTitle} »`
              : ' à un dossier'}{' '}
            sur DcBuilder.
          </Text>
          <Text style={styles.paragraph}>
            Cliquez sur le bouton ci-dessous pour compléter votre profil et
            soumettre vos informations.
          </Text>
          <Section style={{ textAlign: 'center' as const, margin: '32px 0' }}>
            <Link href={url} style={styles.button}>
              Accéder à l&apos;invitation
            </Link>
          </Section>
          <Text style={styles.paragraph}>
            Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre
            navigateur&nbsp;:
          </Text>
          <Text
            style={{
              ...styles.paragraph,
              fontSize: '13px',
              wordBreak: 'break-all' as const,
            }}
          >
            {url}
          </Text>
          <Text style={styles.paragraph}>
            Cette invitation expirera dans 7 jours.
          </Text>
        </Container>
        <Text style={styles.footer}>
          © {new Date().getFullYear()} DcBuilder. Tous droits réservés.
        </Text>
      </Body>
    </Html>
  );
}
