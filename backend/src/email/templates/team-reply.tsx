import { EmailLayout, Heading, Paragraph, PrimaryButton } from './layout.js';
import { Quote, RequestCard, shorten } from './request-parts.js';

export type TeamReplyEmailProps = {
  siteUrl: string;
  firstName: string;
  authorName: string;
  code: string;
  title: string;
  body: string;
  link: string;
};

export const teamReplySubject = (authorName: string, code: string) =>
  `${authorName} replied to ${code}`;

/** A reply from the team on the customer's request. Never an internal note. */
export function TeamReplyEmail(props: TeamReplyEmailProps) {
  return (
    <EmailLayout
      preview={teamReplySubject(props.authorName, props.code)}
      siteUrl={props.siteUrl}
    >
      <Heading>New reply</Heading>
      <Paragraph>
        Hi {props.firstName}, {props.authorName} from FlyConnect Tech Support
        replied to your request.
      </Paragraph>
      <RequestCard code={props.code} title={props.title} />
      <Quote>{shorten(props.body, 1500)}</Quote>
      <PrimaryButton href={props.link}>View and reply</PrimaryButton>
      <Paragraph>
        Please reply in the client portal, so the whole conversation and any
        files stay with your request.
      </Paragraph>
    </EmailLayout>
  );
}
