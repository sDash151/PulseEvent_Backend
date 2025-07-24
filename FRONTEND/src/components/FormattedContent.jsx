import React from 'react';

// FormattedContent: displays text with preserved newlines and spaces, styled for clean UI
const FormattedContent = ({ content }) => (
  <div className="formatted-content">
    {content}
  </div>
);

export default FormattedContent;

// Optionally, for markdown support in the future, consider using react-markdown here. 