import { OrganizationMember, OrgRole } from '@prisma/client';

export type Action =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'export'
  | 'manage_team';
export type Resource =
  | 'dossier'
  | 'candidate'
  | 'client'
  | 'template'
  | 'organization';

const ROLE_PERMISSIONS: Record<OrgRole, Partial<Record<Resource, Action[]>>> = {
  [OrgRole.owner]: {
    dossier: ['create', 'read', 'update', 'delete', 'export'],
    candidate: ['create', 'read', 'update', 'delete'],
    client: ['create', 'read', 'update', 'delete'],
    template: ['create', 'read', 'update', 'delete'],
    organization: ['read', 'update', 'manage_team'],
  },
  [OrgRole.admin]: {
    dossier: ['create', 'read', 'update', 'delete', 'export'],
    candidate: ['create', 'read', 'update', 'delete'],
    client: ['create', 'read', 'update', 'delete'],
    template: ['create', 'read', 'update', 'delete'],
    organization: ['read', 'update', 'manage_team'],
  },
  [OrgRole.editor]: {
    dossier: ['create', 'read', 'update', 'export'],
    candidate: ['create', 'read', 'update'],
    client: ['create', 'read', 'update'],
    template: ['read'],
    organization: ['read'],
  },
  [OrgRole.viewer]: {
    dossier: ['read', 'export'],
    candidate: ['read'],
    client: ['read'],
    template: ['read'],
    organization: ['read'],
  },
};

export function hasPermission(
  role: OrgRole,
  resource: Resource,
  action: Action
): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;

  const resourcePermissions = permissions[resource];
  if (!resourcePermissions) return false;

  return resourcePermissions.includes(action);
}

export function canUser(
  member: OrganizationMember,
  resource: Resource,
  action: Action
): boolean {
  return hasPermission(member.role, resource, action);
}
