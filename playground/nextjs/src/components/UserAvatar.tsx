import * as React from 'react';
import { auth } from '../auth';
import Avatar from '@mui/material/Avatar';

export default async function UserAvatar() {
  const session = await auth();

  if (!session || !session.user) return null;

  return (
    <div>
      <Avatar src={session.user.image || ''} alt={session.user.name || 'User'} />
    </div>
  );
}
