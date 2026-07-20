import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MdChevronRight, MdHome } from 'react-icons/md';
import './Breadcrumb.css';

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // If we are on the dashboard (root), we only show Dashboard.
  // Otherwise, Dashboard is the root.
  
  const formatName = (name) => {
    // Capitalize and replace dashes with spaces
    return name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <nav aria-label="breadcrumb" className="breadcrumb-nav">
      <ol className="breadcrumb-list">
        <li className="breadcrumb-item">
          <Link to="/" className="breadcrumb-link">
            <MdHome size={14} className="breadcrumb-icon" />
            Dashboard
          </Link>
        </li>
        {pathnames.length > 0 && (
          <li className="breadcrumb-separator">
            <MdChevronRight size={14} />
          </li>
        )}
        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          const name = formatName(value);

          return (
            <React.Fragment key={to}>
              <li className="breadcrumb-item">
                {isLast ? (
                  <span className="breadcrumb-current" aria-current="page">
                    {name}
                  </span>
                ) : (
                  <Link to={to} className="breadcrumb-link">
                    {name}
                  </Link>
                )}
              </li>
              {!isLast && (
                <li className="breadcrumb-separator">
                  <MdChevronRight size={14} />
                </li>
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
