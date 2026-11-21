import { EmailLayout, Heading, Paragraph, PrimaryButton } from './layout.js';
import { Quote, RequestCard } from './request-parts.js';

/**
 * A module's client review: "ready" goes to the customer; "changes" and
 * "approved" (the customer's answer) go to the project team.
 */
export type ModuleReviewKind = 'ready' | 'changes' | 'approved';

export type ModuleReviewEmailProps = {
  siteUrl: string;
  firstName: string;
  kind: ModuleReviewKind;
  code: string;
  projectName: string;
  moduleName: string;
  round: number;
  /** The customer's note (changes, or approve with a note). */
  note?: string | null;
  /** Who answered (the customer), for the team's emails. */
  byName?: string;
  link: string;
};

export const moduleReviewSubject = (kind: ModuleReviewKind, module: string) =>
  kind === 'ready'
    ? `Ready for your review: ${module}`
    : kind === 'changes'
      ? `Changes requested on ${module}`
      : `${module} approved`;

export function ModuleReviewEmail(props: ModuleReviewEmailProps) {
  const lines = [
    props.projectName,
    ...(props.round > 1 ? [`Round ${props.round}`] : []),
  ];
  return (
    <EmailLayout
      preview={moduleReviewSubject(props.kind, props.moduleName)}
      siteUrl={props.siteUrl}
    >
      {props.kind === 'ready' ? (
        <>
          <Heading>Ready for your review</Heading>
          <Paragraph>
            Hi {props.firstName}, {props.moduleName} is ready for you to check.
            Have a look, then approve it or tell us what should change.
          </Paragraph>
        </>
      ) : props.kind === 'changes' ? (
        <>
          <Heading>Changes requested</Heading>
          <Paragraph>
            Hi {props.firstName}, {props.byName} asked for changes to{' '}
            {props.moduleName}.
          </Paragraph>
        </>
      ) : (
        <>
          <Heading>Module approved</Heading>
          <Paragraph>
            Hi {props.firstName}, {props.byName} approved {props.moduleName}. It
            is now marked Done.
          </Paragraph>
        </>
      )}
      <RequestCard code={props.code} title={props.moduleName} lines={lines} />
      {props.note ? <Quote>{props.note}</Quote> : null}
      <PrimaryButton href={props.link}>
        {props.kind === 'ready' ? 'Review the module' : 'Open the module'}
      </PrimaryButton>
    </EmailLayout>
  );
}
