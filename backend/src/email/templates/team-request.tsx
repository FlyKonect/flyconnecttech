import { EmailLayout, Heading, Paragraph, PrimaryButton } from './layout.js';
import { Quote, RequestCard, shorten } from './request-parts.js';

/**
 * The emails the team gets about support requests (docs/01, section 7):
 * a request assigned to a developer, a customer's reply for the assigned
 * developer, and the alert about a new Urgent request.
 */

type Common = {
  siteUrl: string;
  firstName: string;
  code: string;
  title: string;
  company: string;
  projectName: string;
  priorityLabel: string;
  /** The request in the team panel. */
  link: string;
};

const lines = (props: Common) => [
  `${props.company} · ${props.projectName}`,
  `Priority: ${props.priorityLabel}`,
];

export const assignedSubject = (code: string) => `${code} was assigned to you`;

export function RequestAssignedEmail(props: Common & { assignedBy: string }) {
  return (
    <EmailLayout
      preview={assignedSubject(props.code)}
      siteUrl={props.siteUrl}
      signOff={false}
    >
      <Heading>A request was assigned to you</Heading>
      <Paragraph>
        Hi {props.firstName}, {props.assignedBy} assigned this request to you.
        Please review it and reply to the customer from the team panel.
      </Paragraph>
      <RequestCard code={props.code} title={props.title} lines={lines(props)} />
      <PrimaryButton href={props.link}>Open request</PrimaryButton>
    </EmailLayout>
  );
}

export const customerRepliedSubject = (customerName: string, code: string) =>
  `${customerName} replied on ${code}`;

export function CustomerRepliedEmail(
  props: Common & { customerName: string; body: string },
) {
  return (
    <EmailLayout
      preview={customerRepliedSubject(props.customerName, props.code)}
      siteUrl={props.siteUrl}
      signOff={false}
    >
      <Heading>New reply from the customer</Heading>
      <Paragraph>
        Hi {props.firstName}, {props.customerName} replied on a request assigned
        to you.
      </Paragraph>
      <RequestCard code={props.code} title={props.title} lines={lines(props)} />
      {props.body ? <Quote>{shorten(props.body, 1500)}</Quote> : null}
      <PrimaryButton href={props.link}>Open request</PrimaryButton>
    </EmailLayout>
  );
}

export const urgentSubject = (code: string, company: string) =>
  `Urgent request ${code} from ${company}`;

export function UrgentRequestEmail(props: Common & { description: string }) {
  return (
    <EmailLayout
      preview={urgentSubject(props.code, props.company)}
      siteUrl={props.siteUrl}
      signOff={false}
    >
      <Heading>New urgent request</Heading>
      <Paragraph>
        Hi {props.firstName}, {props.company} sent an Urgent support request.
      </Paragraph>
      <RequestCard code={props.code} title={props.title} lines={lines(props)} />
      <Quote>{shorten(props.description)}</Quote>
      <PrimaryButton href={props.link}>Review request</PrimaryButton>
    </EmailLayout>
  );
}
