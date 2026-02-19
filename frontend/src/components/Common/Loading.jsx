import './Loading.css'

export default function Loading() {
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
