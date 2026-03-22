import './components.css'

export default function Loading({ fullScreen = false }) {
  if (fullScreen) {
    return (
      <div className="loading loading--fullscreen">
        <div className="loading__spinner" />
        <p className="loading__text">Loading...</p>
      </div>
    )
  }
  return (
    <div className="loading">
      <div className="loading__spinner" />
      <p className="loading__text">Loading...</p>
    </div>
  )
}

export function Spinner() {
  return <div className="spinner" />
}
