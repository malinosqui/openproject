import { ChevronUpIcon, ChevronDownIcon, CheckIcon, PencilIcon, UndoIcon } from '@primer/octicons-react';
import { useCallback, useEffect, useState } from 'react';
import { StoryExpanded, useProjectQueries, Backlog } from './queries';
import { StoryRow } from './StoryRow';
import { IconButton } from '@primer/react';
import { BacklogMenu } from './BacklogMenu';
import { InlineDateRangeField } from './InlineDateRangeField';
import InlineTextField from './InlineTextField';
import { BorderBoxHeading } from './BorderBox';
import { useMutation } from '@tanstack/react-query';
import { useSubmitForm2 } from './mutations';

// <pre>{JSON.stringify(backlogsQuery.data, null, 2)}</pre>
interface BacklogProps {
  backlog:Backlog
}

export function BacklogTable({backlog}:BacklogProps) {
  const [_, typesQuery, statusesQuery] = useProjectQueries('your-scrum-project');
  const types = typesQuery.data?._embedded.elements ?? [];
  const statuses = statusesQuery.data?._embedded.elements ?? [];
  const [stories, setStories] = useState<StoryExpanded[]>([]);
  const { mutate, error, isSuccess } = useSubmitForm2('your-scrum-project', backlog.sprint.id);

  useEffect(() => {
    if (!types.length || !statuses.length) return;

    const expanded = backlog.stories.map((story):StoryExpanded => {
      const type = types.find((t) => t.id === story.type_id)!;
      const status = statuses.find((s) => s.id === story.status_id)!;
      return { ...story, type, status };
    });

    // Sort by position before storing
    setStories(expanded.sort((a, b) => a.position - b.position));
  }, [backlog.stories, types, statuses]);

  const totalPoints = stories
    .map((story) => story.story_points ?? 0)
    .reduce((accum, value) => accum + value, 0);

  const moveItem = useCallback((dragIndex:number, hoverIndex:number) => {
    setStories(prev => {
      const updated = [...prev].sort((a, b) => a.position - b.position);
      const [removed] = updated.splice(dragIndex, 1);
      updated.splice(hoverIndex, 0, removed);

      return updated.map((story, i) => ({ ...story, position: i }));
    });
  }, []);

  const getCurrentPosition = (id:number | string) => stories.find(s => s.id === id)?.position ?? 0;

  const updatePosition = (id:number|string, position:number) => {
    mutate({ id: Number(id), position });
  };

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
          {stories.sort((a, b) => a.position - b.position).map((story, index) => {
            return (
              <li key={story.id} className="Box-row">
                <StoryRow 
                  story={story}
                  projectId={backlog.sprint.project_id}
                  sprintId={backlog.sprint.id}
                  index={index}
                  moveItem={moveItem}
                  getCurrentPosition={getCurrentPosition}
                  updatePosition={updatePosition}
                ></StoryRow>
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


function BacklogHeader({backlog}:BacklogProps) {
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
