import { Loader, Text } from '@mantine/core';

import { Head } from '@/components/seo/head';
import { usePageHeader } from '@/hooks/use-page-header';

import { useUser } from '../api/get-user';
import { UserView } from '../components/user-view';

export interface UserViewPageProps {
  id: number;
}

export function UserViewPage({ id }: UserViewPageProps) {
  const { data: userResponse, isLoading } = useUser({
    variables: id,
  });
  const user = userResponse?.data;

  usePageHeader({
    title: 'User Profile',
    dynamicBreadcrumb: user?.fullName,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center py-8">
        <Text c="dimmed">User not found</Text>
      </div>
    );
  }

  return (
    <>
      <Head title={'User Profile'} />
      <UserView user={user} />
    </>
  );
}
