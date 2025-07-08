const React = require('react');

const LazyLoadImage = (props) => {
  return React.createElement('img', {
    alt: props.alt,
    src: props.src,
    effect: props.effect,
    'data-testid': 'lazy-image',
    ...props
  });
};

module.exports = {
  LazyLoadImage,
};
