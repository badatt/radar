import * as React from 'react';

const AnchorTag = ({ children: link, ...props }) => {
  if (link) {
    return (
      <a href={props.href} className={props.className} target="_blank" rel="noopener noreferrer">
        {link}
      </a>
    );
  } else {
    return null;
  }
};

export default AnchorTag;
