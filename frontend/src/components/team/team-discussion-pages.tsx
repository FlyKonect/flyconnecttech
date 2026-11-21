import {
  NewTopicButton,
  PostMenu,
  ReplyComposer,
  TopicButtons,
} from "@/components/shell/discussion-actions";
import { DiscussionBoard } from "@/components/shell/discussion-board";
import {
  BoardLink,
  DiscussionThread,
} from "@/components/shell/discussion-thread";
import {
  loadTeamProject,
  TeamProjectFrame,
} from "@/components/team/team-project-frame";
import { env } from "@/env";
import { serverApi } from "@/lib/api-server";
import {
  boardPaths,
  type Board,
  type TopicDetail,
  type TopicList,
} from "@/lib/discussions";
import { routes } from "@/lib/routes";

const BOARDS = {
  customer: {
    tab: "discussions",
    label: "Discussions",
    title: "Discussions with the customer",
    intro:
      "Talk with the customer about a specific part of the project. Post proposals for them to approve; mark the reply that answered a question.",
  },
  team: {
    tab: "team-discussions",
    label: "Team discussions",
    title: "Team discussions",
    intro:
      "Only the project team sees these, never the customer. Ask someone by name; the topic shows who it is waiting for.",
  },
} as const;

/** A board's page in the team panel: the project frame and the topics. */
export async function TeamBoard({
  code,
  board,
  status,
  page,
}: {
  code: string;
  board: Board;
  status: "open" | "closed";
  page: string;
}) {
  const { me, project } = await loadTeamProject(code);
  const paths = boardPaths("team", board, project.code);
  const query = new URLSearchParams({
    ...(status === "closed" ? { status } : {}),
    ...(page ? { page } : {}),
  }).toString();
  const list = await serverApi<TopicList>(
    `${paths.api}${query ? `?${query}` : ""}`,
    { signIn: routes.teamSignIn },
  );
  const words = BOARDS[board];
  return (
    <TeamProjectFrame me={me} project={project} tab={words.tab}>
      <DiscussionBoard
        list={list}
        status={status}
        pageHref={paths.page}
        topicHref={paths.topic}
        zone={me.timezone}
        title={words.title}
        intro={words.intro}
        start={
          list.can.start ? (
            <NewTopicButton
              api={paths.api}
              boardHref={paths.page}
              modules={list.modules}
              askChoices={list.askChoices}
              team={board === "team"}
            />
          ) : null
        }
      />
    </TeamProjectFrame>
  );
}

/** One topic in the team panel. */
export async function TeamTopic({
  code,
  board,
  number,
}: {
  code: string;
  board: Board;
  number: string;
}) {
  const { me, project } = await loadTeamProject(code);
  const paths = boardPaths("team", board, project.code);
  const topic = await serverApi<TopicDetail>(
    `${paths.api}/${encodeURIComponent(number)}`,
    { signIn: routes.teamSignIn },
  );
  const words = BOARDS[board];
  return (
    <TeamProjectFrame me={me} project={project} tab={words.tab}>
      <DiscussionThread
        topic={topic}
        zone={me.timezone}
        company={project.customer.company}
        back={<BoardLink href={paths.page} label={words.label} />}
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
            canDelete={topic.can.delete}
          />
        }
        postMenu={(post, index) => (
          <PostMenu
            api={paths.api}
            number={topic.number}
            post={post}
            canAnswer={topic.can.answer && index > 0}
            isAnswer={post.id === topic.answerPostId}
            canRemove={topic.can.removePosts && index > 0}
            canEdit={
              post.mine &&
              topic.status === "OPEN" &&
              (post.kind !== "PROPOSAL" || post.proposal?.state === "PENDING")
            }
          />
        )}
        composer={
          topic.can.reply ? (
            <ReplyComposer
              api={paths.api}
              number={topic.number}
              canPropose={topic.can.propose}
              askChoices={topic.can.ask ? topic.askChoices : []}
              audience={
                board === "team"
                  ? "Only the project team sees this"
                  : "The customer and everyone taking part are notified"
              }
            />
          ) : undefined
        }
      />
    </TeamProjectFrame>
  );
}
