import { EmailLayout, Heading, Paragraph, PrimaryButton } from './layout.js';
import { Quote, RequestCard, shorten } from './request-parts.js';

/**
 * A project discussion: a new topic, a reply, being asked about a topic,
 * a proposal waiting for the customer, or the customer's decision on it.
 */
export type DiscussionEmailKind =
  'new' | 'reply' | 'asked' | 'proposal' | 'approved' | 'changes';

export type DiscussionEmailProps = {
  siteUrl: string;
  firstName: string;
  kind: DiscussionEmailKind;
  authorName: string;
  code: string;
  projectName: string;
  number: number;
  title: string;
  body: string;
  files: number;
  /** Team topics never reach the customer; the email says it is internal. */
  internal: boolean;
  link: string;
};

export const discussionSubject = (
  kind: DiscussionEmailKind,
  author: string,
  title: string,
) => {
  switch (kind) {
    case 'new':
      return `New discussion: ${title}`;
    case 'reply':
      return `${author} replied: ${title}`;
    case 'asked':
      return `${author} asked you: ${title}`;
    case 'proposal':
      return `Proposal waiting for your approval: ${title}`;
    case 'approved':
      return `${author} approved the proposal: ${title}`;
    case 'changes':
      return `${author} asked for changes: ${title}`;
  }
};

const HEADINGS: Record<DiscussionEmailKind, string> = {
  new: 'New discussion',
  reply: 'New reply',
  asked: 'You were asked',
  proposal: 'A proposal for you',
  approved: 'Proposal approved',
  changes: 'Changes requested',
};

export function DiscussionEmail(props: DiscussionEmailProps) {
  const intro: Record<DiscussionEmailKind, string> = {
    new: `${props.authorName} started a discussion on ${props.projectName}.`,
    reply: `${props.authorName} replied on ${props.projectName}.`,
    asked: `${props.authorName} asked you about ${props.projectName}.`,
    proposal: `${props.authorName} posted a proposal on ${props.projectName}. Approve it, or say what should change.`,
    approved: `${props.authorName} approved the proposal on ${props.projectName}.`,
    changes: `${props.authorName} asked for changes to the proposal on ${props.projectName}.`,
  };
  const lines = [
    `#${props.number}${props.internal ? ' · Team discussion' : ''}`,
    ...(props.files
      ? [`${props.files} file${props.files > 1 ? 's' : ''} attached`]
      : []),
  ];
  return (
    <EmailLayout
      preview={discussionSubject(props.kind, props.authorName, props.title)}
      siteUrl={props.siteUrl}
    >
      <Heading>{HEADINGS[props.kind]}</Heading>
      <Paragraph>
        Hi {props.firstName}, {intro[props.kind]}
      </Paragraph>
      <RequestCard code={props.code} title={props.title} lines={lines} />
      {props.body ? <Quote>{shorten(props.body, 1500)}</Quote> : null}
      <PrimaryButton href={props.link}>
        {props.kind === 'proposal'
          ? 'Review the proposal'
          : 'Open the discussion'}
      </PrimaryButton>
      {props.internal ? null : (
        <Paragraph>
          Please reply in the discussion, so everyone sees it and the files stay
          with the topic.
        </Paragraph>
      )}
    </EmailLayout>
  );
}
