import {
  createFontResolver,
  normalizeFileToken,
  type FontRegistryEntry,
} from '@fs-card-engine';

const entries: FontRegistryEntry[] = [
  {
    family: 'Montserrat',
    weight: 400,
    style: 'normal',
    locator: new URL(
      '../../../assets/fonts/Montserrat/Montserrat-Regular.ttf',
      import.meta.url
    ).href,
  },
  {
    family: 'Montserrat',
    weight: 500,
    style: 'normal',
    locator: new URL(
      '../../../assets/fonts/Montserrat/Montserrat-Medium.ttf',
      import.meta.url
    ).href,
  },
  {
    family: 'Montserrat',
    weight: 600,
    style: 'normal',
    locator: new URL(
      '../../../assets/fonts/Montserrat/Montserrat-SemiBold.ttf',
      import.meta.url
    ).href,
  },
  {
    family: 'Montserrat',
    weight: 700,
    style: 'normal',
    locator: new URL(
      '../../../assets/fonts/Montserrat/Montserrat-Bold.ttf',
      import.meta.url
    ).href,
  },
  {
    family: 'Montserrat',
    weight: 800,
    style: 'normal',
    locator: new URL(
      '../../../assets/fonts/Montserrat/Montserrat-ExtraBold.ttf',
      import.meta.url
    ).href,
  },
  {
    family: 'Montserrat',
    weight: 900,
    style: 'normal',
    locator: new URL(
      '../../../assets/fonts/Montserrat/Montserrat-Black.ttf',
      import.meta.url
    ).href,
  },
  {
    family: 'Poppins',
    weight: 400,
    style: 'normal',
    locator: new URL(
      '../../../assets/fonts/Poppins-Regular.ttf',
      import.meta.url
    ).href,
  },
  {
    family: 'Poppins',
    weight: 500,
    style: 'normal',
    locator: new URL(
      '../../../assets/fonts/Poppins-Medium.ttf',
      import.meta.url
    ).href,
  },
  {
    family: 'Poppins',
    weight: 600,
    style: 'normal',
    locator: new URL(
      '../../../assets/fonts/Poppins-SemiBold.ttf',
      import.meta.url
    ).href,
  },
  {
    family: 'Poppins',
    weight: 700,
    style: 'normal',
    locator: new URL('../../../assets/fonts/Poppins-Bold.ttf', import.meta.url)
      .href,
  },
];

const LOCAL_FONT_FILE_URLS = import.meta.glob<string>(
  '../../../assets/fonts/**/*.{ttf,otf,woff,woff2}',
  { eager: true, import: 'default' }
);

const fileTokens = new Map<string, string>();
for (const [filePath, url] of Object.entries(LOCAL_FONT_FILE_URLS)) {
  const fileName = filePath.split('/').pop() ?? '';
  const baseName = fileName.replace(/\.[^.]+$/, '');
  fileTokens.set(normalizeFileToken(baseName), url);
}

export const resolveCardBuilderFont = createFontResolver({
  entries,
  loadFont: async (url) => {
    try {
      const response = await fetch(url);
      if (!response.ok) return null;
      return new Uint8Array(await response.arrayBuffer());
    } catch {
      return null;
    }
  },
  fileTokens,
});
