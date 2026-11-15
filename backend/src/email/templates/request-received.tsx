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
      <Heading>Request submitted</Heading>
      <Paragraph>
        Hi {props.firstName}, we have received your request. Here is your copy.
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
        Next, our team reviews your request. Then a developer is assigned and
        replies. You are notified at every update.
      </Paragraph>
      <PrimaryButton href={props.link}>View request</PrimaryButton>
    </EmailLayout>
  );
}
