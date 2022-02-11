const TWFullScreen = ({ className, children }) => {
  return (
    <div className={`${className} flex flex-col h-screen`}>
      {children}
    </div>
  );
}

TWFullScreen.defaultProps = {
  children: ['child1', 'child2', 'child3'].map(
    (child, index) => <div key={'child-' + index}>{child}</div>
  ),
  className: ""
}

export default TWFullScreen;