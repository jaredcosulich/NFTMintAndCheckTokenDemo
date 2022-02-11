import React from 'react';
import TestRenderer from 'react-test-renderer';
import Index from '../../pages/index';

describe("Index", () => {
  it('renders correctly', () => {
    const rendered = TestRenderer.create(<Index />).toJSON();
    expect(rendered).toMatchSnapshot()
  });
});