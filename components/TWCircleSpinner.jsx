const TWCircleSpinner = ({ message }) => {
  return (
    <div className='text-center'>
      {message && (
        <div className='py-3'>
          {message}
        </div>
      )}
      <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 border-t-0 border-b-0 border-black rounded-full" role="status">
        <span className="invisible">Loading...</span>
      </div>
    </div>
  )
}

export default TWCircleSpinner;