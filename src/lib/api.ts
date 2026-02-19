import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import apiCommonLocales from '@/locales/apiCommonLocales';

import { NextResponseParams } from '@/types/types';

export const handleSuccessResponse = ({
  data,
  message,
}: NextResponseParams) => {
  return NextResponse.json({ success: true, data, message }, { status: 200 });
};

export const handleNotFound = () => {
  return NextResponse.json(
    { success: false, data: {}, message: apiCommonLocales.notFound },
    { status: 400 }
  );
};

export const handleUnauthenticatedResponse = () => {
  return NextResponse.json(
    { success: false, data: {}, message: apiCommonLocales.unAuthenticated },
    { status: 401 }
  );
};

export const handleUnauthorizedResponse = () => {
  return NextResponse.json(
    { success: false, data: {}, message: apiCommonLocales.unAuthorized },
    { status: 403 }
  );
};

export const handleInternalErrorResponse = () => {
  return NextResponse.json(
    { success: false, data: {}, message: apiCommonLocales.internalSeverError },
    { status: 500 }
  );
};

export const getValidSessionOrFail = async () => {
  const session = await auth();

  if (!session || !session.user?.id) {
    return handleUnauthorizedResponse();
  }

  return session;
};
