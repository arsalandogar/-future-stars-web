import { Helmet } from '@dr.pogodin/react-helmet';

type HeadProps = {
  title?: string;
  description?: string;
};

export const Head = ({ title = '', description = '' }: HeadProps = {}) => {
  return (
    <Helmet
      title={title ? `${title} | Future Stars` : undefined}
      defaultTitle="Future Stars"
    >
      <meta name="description" content={description} />
    </Helmet>
  );
};
