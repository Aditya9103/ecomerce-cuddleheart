import React from 'react';

const PageHeader = ({ title, breadcrumbs }) => {
  return (
    <div className="bg-gradient-to-r from-primary/10 to-primary/5 py-12 mb-10 border-b border-primary/10">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-heading mb-4">{title}</h1>
        {breadcrumbs && (
          <nav className="text-sm font-medium text-gray-500">
            {breadcrumbs}
          </nav>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
