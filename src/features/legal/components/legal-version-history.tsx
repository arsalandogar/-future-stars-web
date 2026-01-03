import {
  Anchor,
  Badge,
  Card,
  Loader,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core';
import { Link } from '@tanstack/react-router';

import { formatDate } from '@/utils/date';

import { useLegalVersions } from '../api/get-legal-versions';
import type { LegalDocumentType } from '../types';

interface LegalVersionHistoryProps {
  type: LegalDocumentType;
  basePath: string;
}

export function LegalVersionHistory({
  type,
  basePath,
}: LegalVersionHistoryProps) {
  const { data: versionsResponse, isLoading } = useLegalVersions({
    variables: type,
  });
  const versions = versionsResponse?.data;

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader />
      </div>
    );
  }

  if (!versions || versions.length === 0) {
    return (
      <Card withBorder radius="md" p="lg">
        <Text c="dimmed" ta="center">
          No published versions yet.
        </Text>
      </Card>
    );
  }

  return (
    <Card withBorder radius="md" p="lg">
      <Stack gap="md">
        <Title order={4}>Version History</Title>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Version</Table.Th>
              <Table.Th>Published At</Table.Th>
              <Table.Th>Requires Acceptance</Table.Th>
              <Table.Th>Created By</Table.Th>
              <Table.Th>Published By</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {versions.map((version) => (
              <Table.Tr key={version.id}>
                <Table.Td>
                  <Anchor
                    component={Link}
                    to={`${basePath}/${version.id}`}
                    size="sm"
                    fw={500}
                  >
                    {version.version}
                  </Anchor>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{formatDate(version.publishedAt)}</Text>
                </Table.Td>
                <Table.Td>
                  <Badge
                    color={version.requiresAcceptance ? 'blue' : 'gray'}
                    variant="light"
                  >
                    {version.requiresAcceptance ? 'Yes' : 'No'}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">
                    {version.creator.firstName} {version.creator.lastName}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">
                    {version.publisher
                      ? `${version.publisher.firstName} ${version.publisher.lastName}`
                      : '-'}
                  </Text>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Stack>
    </Card>
  );
}
