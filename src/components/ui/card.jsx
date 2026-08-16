export function Card({ className = "", children, ...props }) {
  // Remove conflicting utility classes to ensure a standardized premium card style
  const cleanedClassName = className
    .replace(/\bborder-none\b/g, '')
    .replace(/\bborder-border\b/g, '')
    .replace(/\bbg-card\b/g, '')
    .replace(/\bbg-white\b/g, '')
    .replace(/\brounded-(?:sm|md|lg|xl|2xl|3xl|none)\b/g, '')
    .replace(/\brounded-\[[^\]]+\]\b/g, '')
    .replace(/\bshadow-sm\b/g, '')
    .replace(/\bshadow-\[[^\]]+\]\b/g, '')
    .trim();

  return (
    <div 
      className={`bg-white border border-gray-100 rounded-2xl shadow-sm transition-all duration-200 overflow-hidden ${cleanedClassName}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = "", children }) {
  return <div className={`px-6 py-5 border-b border-gray-100 ${className}`}>{children}</div>;
}

export function CardTitle({ className = "", children }) {
  return <h3 className={`text-lg font-semibold text-[#475f7b] ${className}`}>{children}</h3>;
}

export function CardContent({ className = "", children }) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}

export function CardDescription({ className = "", children }) {
  return <p className={`text-sm text-gray-500 ${className}`}>{children}</p>;
}

export function CardFooter({ className = "", children }) {
  return <div className={`flex items-center p-6 pt-0 ${className}`}>{children}</div>;
}


