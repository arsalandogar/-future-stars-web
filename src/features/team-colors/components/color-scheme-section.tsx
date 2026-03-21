import { ColorSwatch, Group, Table, Text } from '@mantine/core';

import type { ColorPair } from '@/features/color-palettes';

interface ColorSchemeSectionProps {
  colorPairs: ColorPair[];
  paletteName: string;
}

export function ColorSchemeSection({
  colorPairs,
  paletteName,
}: ColorSchemeSectionProps) {
  return (
    <div className="flex flex-col gap-sm">
      <Text size="xs" fw={700} tt="uppercase" c="dimmed">
        {paletteName} Color Scheme
      </Text>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>
              <Text size="xs" fw={700} tt="uppercase" c="dimmed">
                Area
              </Text>
            </Table.Th>
            <Table.Th>
              <Text size="xs" fw={700} tt="uppercase" c="dimmed">
                Colors
              </Text>
            </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {colorPairs.map((pair, index) => (
            <Table.Tr key={index}>
              <Table.Td>
                <Text size="sm">Area {index + 1}</Text>
              </Table.Td>
              <Table.Td>
                <Group gap="xs" wrap="nowrap">
                  <div className="flex flex-col items-center gap-1">
                    <ColorSwatch color={pair.bg} size={24} />
                    <Text size="xs" c="dimmed" style={{ fontSize: 10 }}>
                      BG
                    </Text>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <ColorSwatch color={pair.fg} size={24} />
                    <Text size="xs" c="dimmed" style={{ fontSize: 10 }}>
                      TEXT
                    </Text>
                  </div>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </div>
  );
}
