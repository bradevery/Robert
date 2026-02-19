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

interface VerifyEmailProps {
  name: string;
  url: string;
}

export default function VerifyEmail({ name, url }: VerifyEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Vérifiez votre adresse email - DcBuilder</Preview>
      <Body style={styles.container}>
        <Container style={styles.card}>
          <Text style={styles.logo}>DcBuilder</Text>
          <Text style={styles.heading}>Bienvenue, {name} !</Text>
          <Text style={styles.paragraph}>
            Merci de vous être inscrit sur DcBuilder. Pour activer votre compte,
            veuillez confirmer votre adresse email en cliquant sur le bouton
            ci-dessous.
          </Text>
          <Section style={{ textAlign: 'center' as const, margin: '32px 0' }}>
            <Link href={url} style={styles.button}>
              Vérifier mon email
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
            Ce lien expirera dans 24 heures. Si vous n&apos;avez pas créé de
            compte, ignorez cet email.
          </Text>
        </Container>
        <Text style={styles.footer}>
          © {new Date().getFullYear()} DcBuilder. Tous droits réservés.
        </Text>
      </Body>
    </Html>
  );
}
