import {
  loadPortalProject,
  PortalProjectFrame,
} from "@/components/portal/portal-project-frame";
import {
  NewTopicButton,
  PostMenu,
  ProposalDecision,
  ReplyComposer,
  TopicButtons,
} from "@/components/shell/discussion-actions";
import { DiscussionBoard } from "@/components/shell/discussion-board";
import {
  BoardLink,
  DiscussionThread,
} from "@/components/shell/discussion-thread";
import { env } from "@/env";
import { serverApi } from "@/lib/api-server";
import {
  boardPaths,
  type TopicDetail,
  type TopicList,
} from "@/lib/discussions";

/** The customer's discussions on one of their projects. */
export async function PortalBoard({
  code,
  status,
  page,
}: {
  code: string;
  status: "open" | "closed";
  page: string;
}) {
  const { me, project } = await loadPortalProject(code);
  const paths = boardPaths("portal", "customer", project.code);
  const query = new URLSearchParams({
    ...(status === "closed" ? { status } : {}),
    ...(page ? { page } : {}),
  }).toString();
  const list = await serverApi<TopicList>(
    `${paths.api}${query ? `?${query}` : ""}`,
  );
  return (
    <PortalProjectFrame project={project} tab="discussions" zone={me.timezone}>
      <DiscussionBoard
        list={list}
        status={status}
        pageHref={paths.page}
        topicHref={paths.topic}
        zone={me.timezone}
        title="Discussions with our team"
        intro="Ask our team about a specific part of your project, share files and approve proposals. For something broken, create a support request instead."
        start={
          list.can.start ? (
            <NewTopicButton
              api={paths.api}
              boardHref={paths.page}
              modules={list.modules}
              askChoices={[]}
              team={false}
            />
          ) : null
        }
      />
    </PortalProjectFrame>
  );
}

/** One of the customer's topics. */
export async function PortalTopic({
  code,
  number,
}: {
  code: string;
  number: string;
}) {
  const { me, project } = await loadPortalProject(code);
  const paths = boardPaths("portal", "customer", project.code);
  const topic = await serverApi<TopicDetail>(
    `${paths.api}/${encodeURIComponent(number)}`,
  );
  return (
    <PortalProjectFrame project={project} tab="discussions" zone={me.timezone}>
      <DiscussionThread
        topic={topic}
        zone={me.timezone}
        company={me.customer?.company}
        back={<BoardLink href={paths.page} label="Discussions" />}
        fileHref={(id) =>
          `${env.NEXT_PUBLIC_API_URL}${paths.file(topic.number, id)}`
        }
        buttons={
          <TopicButtons
            api={paths.api}
            number={topic.number}
            listHref={paths.page}
            canClose={topic.can.close}
            canReopen={topic.can.reopen}
            canDelete={false}
          />
        }
        postMenu={(post, index) => (
          <PostMenu
            api={paths.api}
            number={topic.number}
            post={post}
            canAnswer={topic.can.answer && index > 0}
            isAnswer={post.id === topic.answerPostId}
            canRemove={false}
            canEdit={post.mine && topic.status === "OPEN"}
          />
        )}
        decision={(post) =>
          topic.can.decide ? (
            <ProposalDecision
              api={paths.api}
              number={topic.number}
              postId={post.id}
            />
          ) : null
        }
        composer={
          topic.can.reply ? (
            <ReplyComposer
              api={paths.api}
              number={topic.number}
              canPropose={false}
              askChoices={[]}
              audience="Our team is notified"
            />
          ) : undefined
        }
      />
    </PortalProjectFrame>
  );
}
