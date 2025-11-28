import { BlockHeading } from './BlockHeading';

interface BlockWithHeadingProps {
  heading?: {
    text: string;
    align?: 'left' | 'center' | 'right';
  };
  children: React.ReactNode;
}

export function BlockWithHeading({ heading, children }: BlockWithHeadingProps) {
  return (
    <div>
      {heading?.text && <BlockHeading text={heading.text} align={heading.align} />}
      {children}
    </div>
  );
}
