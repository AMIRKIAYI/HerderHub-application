declare module '@heroicons/react' {
  import * as React from 'react';
  type IconProps = React.SVGProps<SVGSVGElement> & { title?: string };

  export const MenuIcon: React.FC<IconProps>;
  // Add more icons here as needed, e.g.:
  // export const SearchIcon: React.FC<IconProps>;
}

declare module '@heroicons/react/outline' {
  export * from '@heroicons/react';
}

declare module '@heroicons/react/solid' {
  export * from '@heroicons/react';
}
