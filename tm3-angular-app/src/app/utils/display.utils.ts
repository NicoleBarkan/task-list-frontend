import { GroupDto } from '../models/group.model';

export function getGroupNameById(groups: GroupDto[], id: number | null | undefined): string {
  if (id == null) return '—';
  const g = groups.find(x => x.id === id);
  return g?.title ?? `${id}`;
}
