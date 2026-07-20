import React from 'react';
import './Pagination.css';
import { 
  MdChevronLeft, 
  MdChevronRight, 
  MdKeyboardDoubleArrowLeft, 
  MdKeyboardDoubleArrowRight 
} from 'react-icons/md';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  showFirstLast = true 
}) => {
  if (totalPages <= 1) return null;

  const generatePages = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const pages = generatePages();

  return (
    <nav className="pagination" aria-label="Pagination Navigation">
      {showFirstLast && (
        <button 
          className="pagination-btn"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          aria-label="First page"
        >
          <MdKeyboardDoubleArrowLeft size={16} />
        </button>
      )}
      
      <button 
        className="pagination-btn"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        <MdChevronLeft size={16} />
      </button>

      <div className="pagination-numbers">
        {pages.map((page, index) => (
          page === '...' ? (
            <span key={`ellipsis-${index}`} className="pagination-ellipsis">
              ...
            </span>
          ) : (
            <button
              key={page}
              className={`pagination-number ${currentPage === page ? 'active' : ''}`}
              onClick={() => onPageChange(page)}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              {page}
            </button>
          )
        ))}
      </div>

      <button 
        className="pagination-btn"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        <MdChevronRight size={16} />
      </button>

      {showFirstLast && (
        <button 
          className="pagination-btn"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          aria-label="Last page"
        >
          <MdKeyboardDoubleArrowRight size={16} />
        </button>
      )}
    </nav>
  );
};

export default Pagination;
