function Pagination({ pagination, onChange }) {
  const handleClick = (e,page) => {
    e.preventDefault()
    onChangePage(page)
  }

  if (!pagination) return null;

  const {
    current_page,
    total_pages,
    has_prev,
    has_next,
  } = pagination;

  const handlePageChange = (page, e) => {
    e.preventDefault();
    if (page === current_page) return;
    onChange(page);
  };

  return (
    <nav aria-label="Page navigation">
      <ul className="pagination justify-content-center">

        {/* 上一頁 */}
        <li className={`page-item ${!has_prev ? 'disabled' : ''}`}>
          <a
            className="page-link"
            href="#"
            aria-label="Previous"
            onClick={(e) => has_prev && handlePageChange(current_page - 1, e)}
          >
            <span aria-hidden="true">&laquo;</span>
          </a>
        </li>

        {/* 頁碼 */}
        {Array.from({ length: total_pages }, (_, index) => {
          const page = index + 1;
          return (
            <li
              key={`page_${page}`}
              className={`page-item ${page === current_page ? 'active' : ''}`}
            >
              <a
                className="page-link"
                href="#"
                onClick={(e) => handlePageChange(page, e)}
              >
                {page}
              </a>
            </li>
          );
        })}

        {/* 下一頁 */}
        <li className={`page-item ${!has_next ? 'disabled' : ''}`}>
          <a
            className="page-link"
            href="#"
            aria-label="Next"
            onClick={(e) => has_next && handlePageChange(current_page + 1, e)}
          >
            <span aria-hidden="true">&raquo;</span>
          </a>
        </li>

      </ul>
    </nav>
  );
}

export default Pagination;
