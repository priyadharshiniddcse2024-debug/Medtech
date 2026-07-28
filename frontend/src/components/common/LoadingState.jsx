const LoadingState = ({ message = 'Loading...' }) => (
  <div className="loading">
    <div className="pulse">{message}</div>
  </div>
)

export default LoadingState
