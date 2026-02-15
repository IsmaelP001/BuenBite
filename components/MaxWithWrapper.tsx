import { ReactNode } from "react";

interface MaxWidthWrapperProps{
    children:ReactNode;
    className?:string
    maxWidth?:string
}
const MaxWidthWrapper = ({ 
  children, 
  className = '',
  maxWidth = 'max-w-7xl'
}:MaxWidthWrapperProps) => {
  return (
    <div className={`mx-auto w-full px-4 sm:px-6 lg:px-8 ${maxWidth} ${className}`}>
      {children}
    </div>
  );
};

export default MaxWidthWrapper