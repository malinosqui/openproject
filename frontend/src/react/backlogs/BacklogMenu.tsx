import { KebabHorizontalIcon } from '@primer/octicons-react';
import { ActionList, ActionMenu, IconButton } from '@primer/react';

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


