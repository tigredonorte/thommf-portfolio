const React = require('react');

const MockLightbox = (props) => {
  return React.createElement('div', {
    'data-testid': 'mock-lightbox',
    slides: props.slides,
    index: props.index,
    ...props
  });
};

module.exports = MockLightbox;
module.exports.default = MockLightbox;
