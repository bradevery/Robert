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

interface ResetPasswordProps {
  name: string;
  url: string;
}

export default function ResetPassword({ name, url }: ResetPasswordProps) {
  return (
    <Html>
      <Head />
      <Preview>Réinitialisez votre mot de passe - DcBuilder</Preview>
      <Body style={styles.container}>
        <Container style={styles.card}>
          <Text style={styles.logo}>DcBuilder</Text>
          <Text style={styles.heading}>Réinitialisation du mot de passe</Text>
          <Text style={styles.paragraph}>
            Bonjour {name}, nous avons reçu une demande de réinitialisation de
            votre mot de passe. Cliquez sur le bouton ci-dessous pour en choisir
            un nouveau.
          </Text>
          <Section style={{ textAlign: 'center' as const, margin: '32px 0' }}>
            <Link href={url} style={styles.button}>
              Réinitialiser mon mot de passe
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
            Ce lien expirera dans 1 heure. Si vous n&apos;avez pas demandé cette
            réinitialisation, ignorez cet email.
          </Text>
        </Container>
        <Text style={styles.footer}>
          © {new Date().getFullYear()} DcBuilder. Tous droits réservés.
        </Text>
      </Body>
    </Html>
  );
}
