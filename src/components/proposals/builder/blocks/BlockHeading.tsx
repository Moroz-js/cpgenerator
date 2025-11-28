interface BlockHeadingProps {
  text: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export function BlockHeading({ text, align = 'left', className = '' }: BlockHeadingProps) {
  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[align];

  return (
    <h2 className={`text-3xl font-bold mb-6 ${alignClass} ${className}`}>
      {text}
    </h2>
  );
}
