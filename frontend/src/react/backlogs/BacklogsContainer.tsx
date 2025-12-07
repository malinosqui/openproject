import '@primer/primitives/dist/css/functional/themes/light.css';
import {BaseStyles, FormControl, IconButton, TextInput, Text, ThemeProvider, Label, Link, Stack} from '@primer/react';
import React, { ReactNode, useEffect, useState, useMemo, use } from 'react';
import {ActionList, ActionMenu} from '@primer/react';
import { BookIcon, CheckIcon, ChevronDownIcon, ChevronUpIcon, KebabHorizontalIcon, PencilIcon, UndoIcon } from '@primer/octicons-react';
import {Blankslate} from '@primer/react/experimental';

import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { Status, Story, Type, useProjectQueries } from './queries';
import TypeSelect from './TypeSelect';
import StatusSelect from './StatusSelect';
import InlineTextField from './InlineTextField';
import { PathHelperService } from 'core-app/core/path-helper/path-helper.service';
import { useFormStatus } from 'react-dom';

import { Backlog, StoryExpanded } from './queries';
import { useSubmitForm } from './mutations';
import { InlineDateRangeField } from './InlineDateRangeField';


 declare module 'react/jsx-runtime' {
namespace JSX {
  interface IntrinsicElements {
    'collapsible-header':React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    > & {
      start?:string;
      end?:string;
    };
  }
}
 }

const queryClient = new QueryClient();




export default function BacklogsContainer() {


  return (
     <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BaseStyles>
          <Backlogs></Backlogs>
        </BaseStyles>
      </ThemeProvider>
    </QueryClientProvider>
  );
}



function Backlogs() {
 const [backlogsQuery, typesQuery, statusesQuery] = useProjectQueries('your-scrum-project');

  const isLoading =
    backlogsQuery.isPending ||
    typesQuery.isPending ||
    statusesQuery.isPending;

  const isError =
    backlogsQuery.error ||
    typesQuery.error ||
    statusesQuery.error;

  if (isLoading) return 'Loading...';

  if (isError) {
    return (
      'Error: ' +
      (backlogsQuery.error?.message ||
        typesQuery.error?.message ||
        statusesQuery.error?.message)
    );
  }



    return (
    <>

     <div className="d-flex flex-wrap gap-4" >
       {
         backlogsQuery.data.owner_backlogs.map((backlog:Backlog) => {
           return (
             <div key={backlog.sprint.id} style={ {flex: '0 0 calc(50% - var(--base-size-24, 24px))'}}>
             <Backlog backlog={backlog}></Backlog>
             </div>
           );
         })
       }

       {
         backlogsQuery.data.sprint_backlogs.map((backlog:Backlog) => {
           return (
             <div key={backlog.sprint.id} style={ {flex: '0 0 calc(50% - var(--base-size-24, 24px))'}}>
             <Backlog backlog={backlog}></Backlog>
             </div>
           );
         })
       }
     </div>
    </>
  );


}

// <pre>{JSON.stringify(backlogsQuery.data, null, 2)}</pre>
interface BacklogProps {
  backlog:Backlog
}

function Backlog({backlog}:BacklogProps) {
  const [_, typesQuery, statusesQuery] = useProjectQueries('your-scrum-project');
  const types = typesQuery.data?._embedded.elements ?? [];
  const statuses = statusesQuery.data?._embedded.elements ?? [];

  const stories = useMemo(() => {
    if (!types.length || !statuses.length) {
      return [];
    }

    return backlog.stories.map((story):StoryExpanded => {
      const type = types.find((type) => type.id === story.type_id);
      const status = statuses.find((status) => status.id === story.status_id);
      if (!type || !status) {
        return story as StoryExpanded;
      }
      return { ...story, type, status };
    });
  }, [backlog.stories, types, statuses]);

  const totalPoints = stories
    .map((story) => story.story_points ?? 0)
    .reduce((accum, value) => accum + value, 0);

  return (
    <div className="position-relative Box Box--condensed" id="backlog_SPRINT_ID">
      <div className="Box-header color-fg-muted">
        <collapsible-header id="collapsible-header-e2b980e5-43ec-42fc-bbee-6e0ceb8c31f2" className="CollapsibleHeader">
          <div
            data-target="collapsible-header.triggerElement"
            data-action="click:collapsible-header#toggle keydown:collapsible-header#toggleViaKeyboard"
            tabIndex={0}
            role="button"
            aria-expanded="true"
            className="CollapsibleHeader--triggerArea d-flex flex-column"
          >
            <div>
              <BacklogHeader backlog={backlog}></BacklogHeader>
              <div className="velocity">{totalPoints}</div>
              <ChevronUpIcon size="small" data-target="collapsible-header.arrowUp"></ChevronUpIcon>
              <ChevronDownIcon size="small" data-target="collapsible-header.arrowDown"></ChevronDownIcon>
            </div>
            <div>
              <span data-targets="collapsible-header.collapsibleElements" className="color-fg-subtle">This backlog is unique to this one-time meeting. You can drag items in and out to add or remove them from the meeting agenda.</span>
            </div>
          </div>
        </collapsible-header>
      </div>
      {stories.length > 0 && (
        <ul className="stories">
          {stories.map((story) => {
            return (
              <li key={story.id} className="Box-row">
                <StoryRow story={story} projectId={backlog.sprint.project_id} sprintId={backlog.sprint.id}></StoryRow>
              </li>
            );
          })}
          ;
        </ul>
      )}
      {stories.length === 0 && <div className="Box-body">No content</div>}
    </div>
  );
}

//op-border-box-grid
        // <BorderBoxHeading>Type</BorderBoxHeading>
        // <BorderBoxHeading>Subject</BorderBoxHeading>
        // <BorderBoxHeading>Status</BorderBoxHeading>
        // <BorderBoxHeading>Story points</BorderBoxHeading>
interface StoryRowProps {
  story:StoryExpanded;
  sprintId:number|string;
  projectId:number|string;
}

interface WrapperProps {
  mainColumn?:boolean;
  children:ReactNode;
}

interface BorderBoxRowProps {
   children:ReactNode; 
}

interface BorderBoxHeadingProps {
   children:ReactNode; 
}

export function BorderBoxRow({ children }:BorderBoxRowProps) {
  return (
    <div className={'op-border-box-grid'}>{children}</div>
  );
}

export function BorderBoxHeading({ children }:BorderBoxHeadingProps) {
  return (
    <span className={'op-border-box-grid--heading text-semibold'}>{children}</span>
  );
}

export function BorderBoxColumn({ mainColumn, children }:WrapperProps) {
  return (
    <div className={`op-border-box-grid--row-item ${mainColumn ? 'op-border-box-grid--main-column' : ''}`}>{children}</div>
  );
}

export function BacklogHeader({backlog}:BacklogProps) {
  const [isEditing, setIsEditing] = useState(false);

  const [formValues, setFormValues] = useState({
      startDate: backlog.sprint.start_date!,
      endDate: backlog.sprint.effective_date!,
      name: backlog.sprint.name
  });

  const resetForm = () => {
    setFormValues({
      startDate: backlog.sprint.start_date!,
      endDate: backlog.sprint.effective_date!,
            name: backlog.sprint.name
    });
  };

  useEffect(() => { resetForm(); }, [backlog]);

  const handleInputChange = (field:string, value:string) => {
    setFormValues((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSave = () => {
    // mutate({
    //   type_id: formValues.type_id,
    //   subject: formValues.subject,
    //   status_id: formValues.status_id,
    //   story_points: formValues.story_points
    // });
    setIsEditing(false);
  };

  const handleCancel = () => {
    resetForm();
    setIsEditing(false);
  };


  if (isEditing) {
    return (
      <>

        <BorderBoxHeading>
            <InlineTextField 
              value={formValues.name}
              onChange={(event) => handleInputChange('name', event.target.value)}
            ></InlineTextField>
        </BorderBoxHeading> 
        <BorderBoxHeading>
          <InlineDateRangeField value={[formValues.startDate, formValues.endDate]} 
            onChange={([newstartDate, newEndDate]) => { handleInputChange('startDate', newstartDate); handleInputChange('endDate', newEndDate); }}></InlineDateRangeField>
        </BorderBoxHeading> 

        <div className='op-border-box-grid--row-action'>
          <div className="d-flex gap-2">
            <IconButton icon={CheckIcon}  onClick={() => {}} variant="primary" aria-label="Save" />
            <IconButton icon={UndoIcon} aria-label="Cancel" onClick={handleCancel} />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <BorderBoxHeading>
         {backlog.sprint.name}
      </BorderBoxHeading> 
      <div className='d-flex w-full'>
      

      <IconButton  variant="invisible" icon={PencilIcon} aria-label="Edit" onClick={() => setIsEditing(true)} />
      <BacklogMenu onNewStory={() => {}}></BacklogMenu>
      </div>
    </>
  );
}

export function StoryRow({story, sprintId, projectId}:StoryRowProps) {

  const pathHelper = useMemo(() => { return new PathHelperService(); }, []);

  const [backlogsQuery, typesQuery, statusesQuery] = useProjectQueries('your-scrum-project');
  const { mutate, error, isSuccess } = useSubmitForm('your-scrum-project', sprintId.toString(), story.id.toString());

  const isLoading =
    backlogsQuery.isPending ||
    typesQuery.isPending ||
    statusesQuery.isPending;

  const isError =
    backlogsQuery.error ||
    typesQuery.error ||
    statusesQuery.error;

  if (isLoading) return 'Loading...';

  if (isError) {
    return (
      'Error: ' +
      (backlogsQuery.error?.message ||
        typesQuery.error?.message ||
        statusesQuery.error?.message)
    );
  }

  const [isEditing, setIsEditing] = useState(false);
  const [formValues, setFormValues] = useState({
    type_id: story.type_id,
    subject: story.subject,
    status_id: story.status_id,
    story_points: story.story_points ?? 0
  });

  const resetForm = () => {
    setFormValues({
      type_id: story.type_id,
      subject: story.subject,
      status_id: story.status_id,
      story_points: story.story_points ?? 0
    });
  };

  useEffect(() => { resetForm(); }, [story]);

  const handleInputChange = (field:keyof Story, value:Story[keyof Story]) => {
    setFormValues((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSave = () => {
    mutate({
      type_id: formValues.type_id,
      subject: formValues.subject,
      status_id: formValues.status_id,
      story_points: formValues.story_points
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    resetForm();
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <form>
        <BorderBoxRow>
          <BorderBoxColumn>
            <TypeSelect 
              projectId={projectId.toString()} 
              selectedId={formValues.type_id}
              onSelectedIdChange={(selectedId) => {  handleInputChange('type_id', selectedId); }}
            ></TypeSelect>
          </BorderBoxColumn>
          <BorderBoxColumn mainColumn={true}>
            <InlineTextField 
              value={formValues.subject}
              onChange={(event) => handleInputChange('subject', event.target.value)}
            ></InlineTextField>
          </BorderBoxColumn>
          <BorderBoxColumn>
            <StatusSelect
              selectedId={formValues.status_id}
              onSelectedIdChange={(selectedId) => {  handleInputChange('status_id', selectedId);}}
            ></StatusSelect>
          </BorderBoxColumn>
          <BorderBoxColumn>
            <InlineTextField 
              type="number"
              value={formValues.story_points.toString()}
              onChange={(event) => handleInputChange('story_points', event.target.value)}
            ></InlineTextField> 
          </BorderBoxColumn>
          <div className='op-border-box-grid--row-action'>
            <div className="d-flex gap-2">
              <IconButton icon={CheckIcon}  onClick={handleSave} variant="primary" aria-label="Save" />
              <IconButton icon={UndoIcon} aria-label="Cancel" onClick={handleCancel} />
            </div>
          </div>
        </BorderBoxRow>
      </form>
    );
  }

  return (
    <BorderBoxRow>
      <BorderBoxColumn>
        <Link href={pathHelper.workPackagePath(story.id)}>#{story.id}</Link>
      </BorderBoxColumn>
      <BorderBoxColumn>
         <Text as="span" weight="semibold" className={`__hl_inline_type_${story.type_id}`}>
          {story.type?.name}
         </Text>
      </BorderBoxColumn>
      <BorderBoxColumn mainColumn={true}>{story.subject}</BorderBoxColumn>
      <BorderBoxColumn>
        <Label className={`__hl_background_status_${story.status_id}`}>{story.status?.name}</Label>
      </BorderBoxColumn>
      <BorderBoxColumn>
        <span>{story.story_points}</span>
      </BorderBoxColumn>
      <div className='op-border-box-grid--row-action'>
        <IconButton variant="invisible" icon={PencilIcon} aria-label="Edit" onClick={() => setIsEditing(true)} />
      </div>
    </BorderBoxRow>
  );
}

      // <!--
      //   <Blankslate>
      //     <Blankslate.Visual>
      //       <BookIcon size="medium" />
      //     </Blankslate.Visual>
      //     <Blankslate.Heading>Blankslate heading</Blankslate.Heading>
      //     <Blankslate.Description>Use it to provide information when no dynamic content exists.</Blankslate.Description>
      //   </Blankslate>
      // -->

interface BacklogMenuProps {
  onNewStory:() => void;
}

export function BacklogMenu({ onNewStory }:BacklogMenuProps) {
  return (
    <ActionMenu>
      <ActionMenu.Anchor>
        <IconButton icon={KebabHorizontalIcon} aria-label="Open menu" />
      </ActionMenu.Anchor>
      <ActionMenu.Overlay width="small">
        <ActionList aria-label="Watch preference options">
          <ActionList.Item onClick={onNewStory}>
            New Story
          </ActionList.Item>
          <ActionList.Item>
            Stories/Tasks
          </ActionList.Item>
          <ActionList.Item>
           Task board
          </ActionList.Item>
          <ActionList.Item>
           Burndown Chart
          </ActionList.Item>
          <ActionList.Item>
           Wiki
          </ActionList.Item>
          <ActionList.Item>
           Properties
          </ActionList.Item>
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  );
}


