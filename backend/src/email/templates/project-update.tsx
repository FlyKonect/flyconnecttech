import { EmailLayout, Heading, Paragraph, PrimaryButton } from './layout.js';
import { Quote, RequestCard, shorten } from './request-parts.js';

export type ProjectUpdateEmailProps = {
  siteUrl: string;
  firstName: string;
  authorName: string;
  code: string;
  name: string;
  body: string;
  /** "Progress: 6 of 10 done (60%)", or nothing when no items are listed. */
  progress: string | null;
  files: number;
  link: string;
};

export const projectUpdateSubject = (name: string) => `Update on ${name}`;

/** The team posted an update on one of the customer's projects. */
export function ProjectUpdateEmail(props: ProjectUpdateEmailProps) {
  const lines = [
    ...(props.progress ? [props.progress] : []),
    ...(props.files
      ? [`${props.files} file${props.files > 1 ? 's' : ''} attached`]
      : []),
  ];
  return (
    <EmailLayout
      preview={projectUpdateSubject(props.name)}
      siteUrl={props.siteUrl}
    >
      <Heading>Project update</Heading>
      <Paragraph>
        Hi {props.firstName}, {props.authorName} from FlyConnect Tech posted an
        update on your project.
      </Paragraph>
      <RequestCard code={props.code} title={props.name} lines={lines} />
      {props.body ? <Quote>{shorten(props.body, 1500)}</Quote> : null}
      <PrimaryButton href={props.link}>View project</PrimaryButton>
      <Paragraph>
        Questions about this update? Create a support request for this project
        in the client portal.
      </Paragraph>
    </EmailLayout>
  );
}
