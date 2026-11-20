import { EmailLayout, Heading, Paragraph, PrimaryButton } from './layout.js';
import { Quote, RequestCard, shorten } from './request-parts.js';

export type RequestReceivedEmailProps = {
  siteUrl: string;
  firstName: string;
  code: string;
  title: string;
  projectName: string;
  typeLabel: string;
  priorityLabel: string;
  description: string;
  fileCount: number;
  link: string;
};

export const requestReceivedSubject = (code: string) =>
  `We received your request ${code}`;

/** The customer's copy of a new support request (screen 11: "emailed you a copy"). */
export function RequestReceivedEmail(props: RequestReceivedEmailProps) {
  const files = props.fileCount === 1 ? '1 file' : `${props.fileCount} files`;
  return (
    <EmailLayout
      preview={requestReceivedSubject(props.code)}
      siteUrl={props.siteUrl}
    >
      <Heading>We have received your request</Heading>
      <Paragraph>
        Hi {props.firstName}, thank you for getting in touch. Your support
        request is with our team, and here is your copy for your records.
      </Paragraph>
      <RequestCard
        code={props.code}
        title={props.title}
        lines={[
          `${props.projectName} · ${props.typeLabel}`,
          `Priority: ${props.priorityLabel}${props.fileCount ? ` · ${files} attached` : ''}`,
        ]}
      />
      <Quote>{shorten(props.description)}</Quote>
      <Paragraph>
        What happens next: our team reviews your request and assigns it to a
        developer, who replies in the client portal. You get an email at every
        reply and status change.
      </Paragraph>
      <PrimaryButton href={props.link}>View request</PrimaryButton>
    </EmailLayout>
  );
}
