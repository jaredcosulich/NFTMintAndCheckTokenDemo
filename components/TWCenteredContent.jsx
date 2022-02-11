const TWCenteredContent = ({ children }) => {
  return (
    <div className="flex items-center justify-center flex-grow">
      <div className="inline-block">
    	  {children}
      </div>
    </div>
  );
}

TWCenteredContent.defaultProps = {
  children: ['child1', 'child2', 'child3'].map(
    (child, index) => <div key={'child-' + index}>{child}</div>
  )
}

export default TWCenteredContent;