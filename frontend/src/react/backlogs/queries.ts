import { useQueries } from '@tanstack/react-query';

const fetchBacklogs = async (projectId:string) => {
  const res = await fetch(`/projects/${projectId}/backlogs.json`);
  if (!res.ok) throw new Error('Failed to fetch backlogs');
  return res.json();
};

export const fetchTypes = async (projectId:string):Promise<HalCollection<Type>>  => {
  const res = await fetch(`/api/v3/projects/${projectId}/types`);
  if (!res.ok) throw new Error('Failed to fetch project types');
  return res.json();
};

export const fetchStatuses = async ():Promise<HalCollection<Status>>  => {
  const res = await fetch('/api/v3/statuses');
  if (!res.ok) throw new Error('Failed to fetch statuses');
  return res.json();
};

export function useProjectQueries(projectId:string) {
  return useQueries({
    queries: [
      {
        queryKey: ['backlogs', projectId],
        queryFn: () => fetchBacklogs(projectId),
        enabled: !!projectId
      },
      {
        queryKey: ['projectTypes', projectId],
        queryFn: () => fetchTypes(projectId),
        enabled: !!projectId
      },
      {
        queryKey: ['statuses'],
        queryFn: fetchStatuses,
      },
    ],
  });
}

export interface Sprint {
  id:number;
  project_id:number;
  name:string;
  description:string;
  effective_date:string|null;
  created_at:string;
  updated_at:string|null;
  wiki_page_title:string|null;
  status:string;
  sharing:string;
  start_date:string|null;
}

export interface Story {
  id:number;
  subject:string;
  story_points?:number;
  status_id:number;
  type_id:number;
  version_id:number;
  position:number;
}
export interface Backlog {
  sprint:Sprint;
  stories:Story[];
  owner_backlog:boolean;
}

export interface StoryExpanded extends Story {
  type:Type;
  status:Status;
}



export interface HalCollection<E> {
  total:number;
  count:number;
  _embedded:{
    elements:E[]
  }
}
export interface Status {
  id:number;
  name:string;
  color:string;
  isClosed:boolean;
  isDefault:boolean;
  isReadonly:boolean;
  excludedFromTotals:boolean;
  defaultDoneRatio:number;
  position:number;
}
export interface Type {
  id:number;
  name:string;
  color:string;
  isDefault:boolean;
  isMilestone:boolean;
  position:number;
}

